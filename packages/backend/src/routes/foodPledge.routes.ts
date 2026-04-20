import { Router } from 'express';
import foodPledgeController from '../controllers/foodPledge.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// ── Donor routes ───────────────────────────────────────────────────────────────

// Create a new food pledge
// POST /api/food-pledges
router.post(
  '/',
  authenticate,
  requireRole(Role.DONOR, Role.SUPER_ADMIN),
  foodPledgeController.createFoodPledge.bind(foodPledgeController)
);

// Get a single pledge by ID
// GET /api/food-pledges/:id
router.get(
  '/:id',
  authenticate,
  foodPledgeController.getFoodPledgeById.bind(foodPledgeController)
);

// Cancel a pledge — donor or NGO member
// PATCH /api/food-pledges/:id/cancel
router.patch(
  '/:id/cancel',
  authenticate,
  foodPledgeController.cancelPledge.bind(foodPledgeController)
);

// ── NGO routes ─────────────────────────────────────────────────────────────────

// Confirm a pledge — NGO acknowledges incoming drop off
// PATCH /api/food-pledges/:id/confirm
router.patch(
  '/:id/confirm',
  authenticate,
  requireRole(Role.NGO, Role.SUPER_ADMIN),
  foodPledgeController.confirmPledge.bind(foodPledgeController)
);

// Fulfil a pledge — NGO confirms food received
// PATCH /api/food-pledges/:id/fulfil
router.patch(
  '/:id/fulfil',
  authenticate,
  requireRole(Role.NGO, Role.SUPER_ADMIN),
  foodPledgeController.fulfilPledge.bind(foodPledgeController)
);

// Get all pledges for an NGO — NGO dashboard
// GET /api/food-pledges/ngo/:ngoId
router.get(
  '/ngo/:ngoId',
  authenticate,
  requireRole(Role.NGO, Role.ADMIN, Role.SUPER_ADMIN),
  foodPledgeController.getNGOPledges.bind(foodPledgeController)
);

// Get all pledges for a specific food need
// GET /api/food-pledges/food-need/:foodNeedId
router.get(
  '/food-need/:foodNeedId',
  authenticate,
  requireRole(Role.NGO, Role.ADMIN, Role.SUPER_ADMIN),
  foodPledgeController.getFoodNeedPledges.bind(foodPledgeController)
);

export default router;
