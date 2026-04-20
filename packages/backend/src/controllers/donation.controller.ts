import { Request, Response, NextFunction } from 'express';
import donationService from '../services/donation.service';
import { responses } from '../utils/apiResponse';
import { writeAuditLog } from '../middleware/audit';
import { AuditAction, AuditEntityType } from '@prisma/client';

const getParam = (param: unknown): string => {
  if (Array.isArray(param)) return String(param[0]);
  if (typeof param === 'string') return param;
  return '';
};

const getQuery = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return String(value[0]);
  if (typeof value === 'string') return value;
  return undefined;
};

export class DonationController {
  // POST /api/donations
  // Creates a Stripe PaymentIntent and a PENDING donation record
  async createPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const { ngoId, amount, currency, message, isAnonymous } = req.body;

      // Validate required fields
      if (!ngoId) {
        responses.badRequest(res, 'NGO ID is required');
        return;
      }

      if (!amount || typeof amount !== 'number') {
        responses.badRequest(res, 'A valid donation amount is required');
        return;
      }

      const result = await donationService.createPaymentIntent(
        {
          ngoId,
          amount,
          currency: currency ?? 'CAD',
          message,
          isAnonymous: isAnonymous ?? false,
        },
        req.user.id
      );

      await writeAuditLog(req, {
        action: AuditAction.DONATION_INITIATED,
        entityType: AuditEntityType.DONATION,
        entityId: result.donation.id,
        newState: {
          status: result.donation.status,
          amount: result.donation.amount,
          currency: result.donation.currency,
        },
        notes: 'Donation PaymentIntent created',
      });

      responses.created(res, 'Payment intent created successfully', {
        donation: result.donation,
        clientSecret: result.clientSecret,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/donations/webhook
  // Receives Stripe webhook events
  // Must use raw body — configured in app.ts
  async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        responses.badRequest(res, 'Missing Stripe signature');
        return;
      }

      // req.body is the raw buffer here — see app.ts configuration
      await donationService.handleWebhookEvent(req.body, signature);

      responses.ok(res, 'Webhook received');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/donations/:id
  async getDonationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const id = getParam(req.params.id);
      const donation = await donationService.getDonationById(id, req.user.id);

      responses.ok(res, 'Donation retrieved successfully', { donation });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/donations/ngo/:ngoId
  // NGO dashboard — view donations received
  async getNGODonations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const ngoId = getParam(req.params.ngoId);

      const result = await donationService.getNGODonations(
        ngoId,
        getQuery(req.query.page),
        getQuery(req.query.limit),
        getQuery(req.query.status)
      );

      responses.ok(res, 'NGO donations retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/donations — admin only
  async adminGetAllDonations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await donationService.adminGetAllDonations(
        getQuery(req.query.page),
        getQuery(req.query.limit),
        getQuery(req.query.status),
        getQuery(req.query.ngoId)
      );

      responses.ok(res, 'Donations retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new DonationController();
