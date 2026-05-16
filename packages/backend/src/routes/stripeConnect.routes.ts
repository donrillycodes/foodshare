import { Router } from 'express';
import { Role } from '@prisma/client';
import stripeConnectController from '../controllers/stripeConnect.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// All routes require authentication and NGO role
router.use(authenticate);
router.use(requireRole(Role.NGO));

// GET /api/stripe-connect/status
router.get('/status', (req, res, next) =>
  stripeConnectController.getStatus(req, res, next)
);

// POST /api/stripe-connect/onboard
router.post('/onboard', (req, res, next) =>
  stripeConnectController.startOnboarding(req, res, next)
);

// POST /api/stripe-connect/refresh
router.post('/refresh', (req, res, next) =>
  stripeConnectController.refreshLink(req, res, next)
);

// DELETE /api/stripe-connect/disconnect
router.delete('/disconnect', (req, res, next) =>
  stripeConnectController.disconnect(req, res, next)
);

export default router;
