import { Request, Response, NextFunction } from 'express';
import stripeConnectService from '../services/stripeConnect.service';
import { responses } from '../utils/apiResponse';
import db from '../config/database';

class StripeConnectController {
  private async getNGOId(userId: string): Promise<string | null> {
    const ngo = await db.nGO.findUnique({
      where: { managerId: userId },
      select: { id: true },
    });
    return ngo?.id ?? null;
  }

  // GET /api/stripe-connect/status
  async getStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }
      const ngoId = await this.getNGOId(req.user.id);
      if (!ngoId) {
        responses.notFound(res, 'You do not manage an NGO');
        return;
      }
      const status = await stripeConnectService.getConnectStatus(ngoId);
      responses.ok(res, 'Connect status retrieved', status);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/stripe-connect/onboard
  async startOnboarding(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }
      const ngoId = await this.getNGOId(req.user.id);
      if (!ngoId) {
        responses.notFound(res, 'You do not manage an NGO');
        return;
      }
      const result = await stripeConnectService.createConnectAccount(ngoId);
      responses.ok(res, 'Onboarding link generated', result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/stripe-connect/refresh
  async refreshLink(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }
      const ngoId = await this.getNGOId(req.user.id);
      if (!ngoId) {
        responses.notFound(res, 'You do not manage an NGO');
        return;
      }
      const result = await stripeConnectService.refreshOnboardingLink(ngoId);
      responses.ok(res, 'Onboarding link refreshed', result);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/stripe-connect/disconnect
  async disconnect(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }
      const ngoId = await this.getNGOId(req.user.id);
      if (!ngoId) {
        responses.notFound(res, 'You do not manage an NGO');
        return;
      }
      const result = await stripeConnectService.disconnectAccount(ngoId);
      responses.ok(res, 'Stripe account disconnected', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new StripeConnectController();
