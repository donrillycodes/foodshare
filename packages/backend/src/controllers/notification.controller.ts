import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notification.service';
import { responses } from '../utils/apiResponse';

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

export class NotificationController {
  // GET /api/notifications
  async getUserNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const result = await notificationService.getUserNotifications(
        req.user.id,
        getQuery(req.query.page),
        getQuery(req.query.limit),
        getQuery(req.query.status)
      );

      responses.ok(res, 'Notifications retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/unread-count
  async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const count = await notificationService.getUnreadCount(req.user.id);
      responses.ok(res, 'Unread count retrieved successfully', { count });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/:id/read
  async markAsRead(
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
      const notification = await notificationService.markAsRead(
        id,
        req.user.id
      );

      responses.ok(res, 'Notification marked as read', { notification });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/read-all
  async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        responses.unauthorized(res);
        return;
      }

      const count = await notificationService.markAllAsRead(req.user.id);
      responses.ok(res, `${count} notifications marked as read`, { count });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/:id/archive
  async archiveNotification(
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
      await notificationService.archiveNotification(id, req.user.id);
      responses.ok(res, 'Notification archived successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
