import { Request, Response, NextFunction } from 'express';
import foodPledgeService from '../services/foodPledge.service';
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

export class FoodPledgeController {
  // POST /api/food-pledges
  async createFoodPledge(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const { foodNeedId, quantityPledged, dropOffDate, notes } = req.body;

      if (!foodNeedId) {
        responses.badRequest(res, 'Food need ID is required');
        return;
      }

      if (quantityPledged === undefined || quantityPledged === null) {
        responses.badRequest(res, 'Quantity pledged is required');
        return;
      }

      const pledge = await foodPledgeService.createFoodPledge(
        {
          foodNeedId,
          quantityPledged: Number(quantityPledged),
          dropOffDate,
          notes,
        },
        req.user.id
      );

      await writeAuditLog(req, {
        action: AuditAction.PLEDGE_CREATED,
        entityType: AuditEntityType.FOOD_PLEDGE,
        entityId: pledge.id,
        newState: {
          status: pledge.status,
          quantityPledged: pledge.quantityPledged,
          foodNeedId,
        },
      });

      responses.created(res, 'Pledge created successfully', { pledge });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/food-pledges/:id
  async getFoodPledgeById(
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
      const pledge = await foodPledgeService.getFoodPledgeById(id, req.user.id);

      responses.ok(res, 'Pledge retrieved successfully', { pledge });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/food-pledges/:id/confirm
  async confirmPledge(
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
      const previous = await foodPledgeService.getFoodPledgeForAudit(id);
      const pledge = await foodPledgeService.confirmPledge(id, req.user.id);

      await writeAuditLog(req, {
        action: AuditAction.PLEDGE_FULFILLED,
        entityType: AuditEntityType.FOOD_PLEDGE,
        entityId: id,
        previousState: { status: previous.status },
        newState: { status: pledge.status },
        notes: 'Pledge confirmed by NGO',
      });

      responses.ok(res, 'Pledge confirmed successfully', { pledge });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/food-pledges/:id/fulfil
  async fulfilPledge(
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
      const previous = await foodPledgeService.getFoodPledgeForAudit(id);
      const pledge = await foodPledgeService.fulfilPledge(id, req.user.id);

      await writeAuditLog(req, {
        action: AuditAction.PLEDGE_FULFILLED,
        entityType: AuditEntityType.FOOD_PLEDGE,
        entityId: id,
        previousState: { status: previous.status },
        newState: { status: pledge.status },
        notes: 'Pledge fulfilled — food received by NGO',
      });

      responses.ok(res, 'Pledge fulfilled successfully', { pledge });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/food-pledges/:id/cancel
  async cancelPledge(
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
      const { reason } = req.body;

      if (!reason || reason.trim().length < 5) {
        responses.badRequest(
          res,
          'A cancellation reason of at least 5 characters is required'
        );
        return;
      }

      const previous = await foodPledgeService.getFoodPledgeForAudit(id);
      const pledge = await foodPledgeService.cancelPledge(
        id,
        req.user.id,
        reason.trim()
      );

      await writeAuditLog(req, {
        action: AuditAction.PLEDGE_CANCELLED,
        entityType: AuditEntityType.FOOD_PLEDGE,
        entityId: id,
        previousState: { status: previous.status },
        newState: { status: pledge.status },
        notes: reason,
      });

      responses.ok(res, 'Pledge cancelled successfully', { pledge });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/food-pledges/ngo/:ngoId
  async getNGOPledges(
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

      const result = await foodPledgeService.getNGOPledges(
        ngoId,
        getQuery(req.query.page),
        getQuery(req.query.limit),
        getQuery(req.query.status)
      );

      responses.ok(res, 'NGO pledges retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/food-pledges/food-need/:foodNeedId
  async getFoodNeedPledges(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const foodNeedId = getParam(req.params.foodNeedId);

      const result = await foodPledgeService.getFoodNeedPledges(
        foodNeedId,
        getQuery(req.query.page),
        getQuery(req.query.limit)
      );

      responses.ok(res, 'Food need pledges retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new FoodPledgeController();
