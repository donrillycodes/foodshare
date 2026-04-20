import db from '../config/database';
import { stripe } from '../config/stripe';
import { AppError } from '../middleware/error';
import logger from '../utils/logger';
import {
  getPaginationParams,
  buildPaginatedResponse,
} from '../utils/pagination';
import { DonationStatus, PaymentProvider } from '@prisma/client';
import { CreateDonationInput } from '../types';

export class DonationService {
  // Create a Stripe PaymentIntent and a PENDING donation record
  // Called when donor initiates a donation in the mobile app
  async createPaymentIntent(input: CreateDonationInput, donorId: string) {
    // Verify the NGO exists and is approved
    const ngo = await db.nGO.findUnique({
      where: { id: input.ngoId },
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true,
        stripeAccountId: true,
      },
    });

    if (!ngo) {
      throw new AppError('NGO not found', 404);
    }

    if (ngo.status !== 'APPROVED' || !ngo.isActive) {
      throw new AppError('This NGO is not currently accepting donations', 400);
    }

    // Validate donation amount
    // Minimum donation is $1 CAD
    if (input.amount < 1) {
      throw new AppError('Minimum donation amount is $1.00', 400);
    }

    // Maximum donation is $10,000 CAD per transaction
    if (input.amount > 10000) {
      throw new AppError(
        'Maximum donation amount per transaction is $10,000.00',
        400
      );
    }

    // Get donor details for Stripe metadata
    const donor = await db.user.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    // Convert amount to cents for Stripe
    // Stripe always works in smallest currency unit
    // $50.00 CAD = 5000 cents
    const amountInCents = Math.round(input.amount * 100);

    // Create the Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: (input.currency ?? 'cad').toLowerCase(),
      metadata: {
        donorId: donor.id,
        donorEmail: donor.email,
        ngoId: ngo.id,
        ngoName: ngo.name,
        isAnonymous: String(input.isAnonymous ?? false),
      },
      description: `Donation to ${ngo.name} via FoodShare`,
      receipt_email: donor.email,
    });

    // Create a PENDING donation record in our database
    const donation = await db.donation.create({
      data: {
        donorId,
        ngoId: input.ngoId,
        amount: input.amount,
        currency: (input.currency ?? 'CAD').toUpperCase(),
        paymentProvider: PaymentProvider.STRIPE,
        providerPaymentId: paymentIntent.id,
        status: DonationStatus.PENDING,
        message: input.message,
        isAnonymous: input.isAnonymous ?? false,
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        isAnonymous: true,
        message: true,
        createdAt: true,
      },
    });

    logger.info(
      `PaymentIntent created: ${paymentIntent.id} for donor: ${donorId} to NGO: ${input.ngoId}`
    );

    return {
      donation,
      clientSecret: paymentIntent.client_secret,
    };
  }

  // Handle Stripe webhook events
  // Called by Stripe when payment status changes
  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    let event;

    // Verify the webhook signature
    // This confirms the request genuinely came from Stripe
    // and was not tampered with in transit
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      logger.error('Stripe webhook signature verification failed', { error });
      throw new AppError('Invalid webhook signature', 400);
    }

    logger.info(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
    }

    return { received: true };
  }

  // Handle successful payment
  private async handlePaymentSuccess(paymentIntent: any) {
    const donation = await db.donation.findFirst({
      where: { providerPaymentId: paymentIntent.id },
    });

    if (!donation) {
      logger.error(`No donation found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    // Update donation status to COMPLETED
    await db.donation.update({
      where: { id: donation.id },
      data: {
        status: DonationStatus.COMPLETED,
        providerTransferId: paymentIntent.latest_charge,
      },
    });

    logger.info(
      `Donation completed: ${donation.id} amount: ${donation.amount} ${donation.currency}`
    );

    // TODO: Send FCM push notification to donor
    // We will implement this when we build the notification service
  }

  // Handle failed payment
  private async handlePaymentFailure(paymentIntent: any) {
    const donation = await db.donation.findFirst({
      where: { providerPaymentId: paymentIntent.id },
    });

    if (!donation) {
      logger.error(
        `No donation found for failed PaymentIntent: ${paymentIntent.id}`
      );
      return;
    }

    // Update donation status to FAILED
    await db.donation.update({
      where: { id: donation.id },
      data: { status: DonationStatus.FAILED },
    });

    logger.info(`Donation failed: ${donation.id}`);

    // TODO: Send FCM push notification to donor
  }

  // Get a single donation by ID
  async getDonationById(donationId: string, requesterId: string) {
    const donation = await db.donation.findUnique({
      where: { id: donationId },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        type: true,
        isAnonymous: true,
        message: true,
        paymentProvider: true,
        createdAt: true,
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ngo: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    // Donors can only view their own donations
    // Admins can view any donation
    if (donation.donor.id !== requesterId) {
      throw new AppError(
        'You do not have permission to view this donation',
        403
      );
    }

    // Respect anonymity — hide donor details if anonymous
    if (donation.isAnonymous) {
      return {
        ...donation,
        donor: null,
      };
    }

    return donation;
  }

  // Get all donations for an NGO — NGO dashboard
  async getNGODonations(
    ngoId: string,
    page?: string,
    limit?: string,
    status?: string
  ) {
    const params = getPaginationParams(page, limit);

    const where: any = { ngoId };

    if (status) {
      where.status = status as DonationStatus;
    }

    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          isAnonymous: true,
          message: true,
          createdAt: true,
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      db.donation.count({ where }),
    ]);

    // Mask anonymous donor details
    const maskedDonations = donations.map((donation) => ({
      ...donation,
      donor: donation.isAnonymous ? null : donation.donor,
    }));

    return buildPaginatedResponse(maskedDonations, total, params);
  }

  // Admin — get all donations across the platform
  async adminGetAllDonations(
    page?: string,
    limit?: string,
    status?: string,
    ngoId?: string
  ) {
    const params = getPaginationParams(page, limit);

    const where: any = {};

    if (status) where.status = status as DonationStatus;
    if (ngoId) where.ngoId = ngoId;

    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paymentProvider: true,
          providerPaymentId: true,
          isAnonymous: true,
          createdAt: true,
          donor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          ngo: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.donation.count({ where }),
    ]);

    return buildPaginatedResponse(donations, total, params);
  }
}

export default new DonationService();
