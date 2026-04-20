import { Router, Request, Response, NextFunction } from 'express';
import donationController from '../controllers/donation.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/rbac';
import { donationLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// ── Stripe webhook ─────────────────────────────────────────────────────────────
// IMPORTANT: This route must be registered BEFORE the JSON body parser
// Stripe webhook verification requires the raw unparsed request body
// This is handled in app.ts by applying raw body parser to this route only
// POST /api/donations/webhook
router.post(
  '/webhook',
  donationController.handleWebhook.bind(donationController)
);

// ── Donor routes ───────────────────────────────────────────────────────────────

// Create a PaymentIntent and initiate a donation
// POST /api/donations
router.post(
  '/',
  authenticate,
  requireRole(Role.DONOR, Role.SUPER_ADMIN),
  donationLimiter,
  donationController.createPaymentIntent.bind(donationController)
);

// Get a single donation by ID
// GET /api/donations/:id
router.get(
  '/:id',
  authenticate,
  donationController.getDonationById.bind(donationController)
);

// ── NGO routes ─────────────────────────────────────────────────────────────────

// Get donations received by a specific NGO
// GET /api/donations/ngo/:ngoId
router.get(
  '/ngo/:ngoId',
  authenticate,
  requireRole(Role.NGO, Role.ADMIN, Role.SUPER_ADMIN),
  donationController.getNGODonations.bind(donationController)
);

// ── Admin routes ───────────────────────────────────────────────────────────────

// Get all donations across the platform
// GET /api/donations/admin/all
router.get(
  '/admin/all',
  authenticate,
  requirePermission('canManageDonations'),
  donationController.adminGetAllDonations.bind(donationController)
);

export default router;
