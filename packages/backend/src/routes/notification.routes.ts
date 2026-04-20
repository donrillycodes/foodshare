import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
// Notifications are always personal — no public endpoints

// Get all notifications for authenticated user
// GET /api/notifications
router.get(
  '/',
  authenticate,
  notificationController.getUserNotifications.bind(notificationController)
);

// Get unread notification count — for mobile app badge
// GET /api/notifications/unread-count
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount.bind(notificationController)
);

// Mark all notifications as read
// PATCH /api/notifications/read-all
router.patch(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

// Mark a single notification as read
// PATCH /api/notifications/:id/read
router.patch(
  '/:id/read',
  authenticate,
  notificationController.markAsRead.bind(notificationController)
);

// Archive a notification
// PATCH /api/notifications/:id/archive
router.patch(
  '/:id/archive',
  authenticate,
  notificationController.archiveNotification.bind(notificationController)
);

export default router;
