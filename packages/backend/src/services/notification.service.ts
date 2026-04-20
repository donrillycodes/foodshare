import db from '../config/database';
import admin from '../config/firebase';
import { AppError } from '../middleware/error';
import logger from '../utils/logger';
import {
  getPaginationParams,
  buildPaginatedResponse,
} from '../utils/pagination';
import {
  NotificationStatus,
  NotificationType,
  NotificationReferenceType,
} from '@prisma/client';
import { CreateNotificationInput } from '../types';

export class NotificationService {
  // Send a push notification and record it in the database
  // This is the central notification function used across the entire app
  // Called from donation service, pledge service, NGO service etc.
  async sendNotification(input: CreateNotificationInput): Promise<void> {
    // Step 1 — Create the notification record in our database
    // We do this first so the notification exists even if Firebase delivery fails
    let notification;
    try {
      notification = await db.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          body: input.body,
          type: input.type as NotificationType,
          referenceId: input.referenceId,
          referenceType: input.referenceType as
            | NotificationReferenceType
            | undefined,
          isSent: false,
          // Set expiry based on notification type
          // Important notifications last longer than informational ones
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    } catch (error) {
      logger.error('Failed to create notification record', { error, input });
      return;
    }

    // Step 2 — Get the user's Firebase token for push delivery
    // We store this in the database when the user registers their device
    // For now we attempt delivery and handle missing tokens gracefully
    try {
      const user = await db.user.findUnique({
        where: { id: input.userId },
        select: { firebaseUid: true },
      });

      if (!user) {
        logger.warn(`User not found for notification: ${input.userId}`);
        return;
      }

      // Send via Firebase Cloud Messaging
      await admin.messaging().send({
        notification: {
          title: input.title,
          body: input.body,
        },
        data: {
          type: input.type,
          referenceId: input.referenceId ?? '',
          referenceType: input.referenceType ?? '',
          notificationId: notification.id,
        },
        topic: `user-${input.userId}`,
      });

      // Mark as sent in our database
      await db.notification.update({
        where: { id: notification.id },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });

      logger.info(
        `Notification sent: ${notification.id} to user: ${input.userId}`
      );
    } catch (error) {
      // Firebase delivery failed — notification record exists but isSent stays false
      // The cron job or retry mechanism can attempt redelivery later
      logger.error('Failed to send push notification', {
        error,
        notificationId: notification.id,
        userId: input.userId,
      });
    }
  }

  // Send notification to multiple users at once
  // Used for bulk notifications like NGO update announcements
  async sendBulkNotification(
    userIds: string[],
    input: Omit<CreateNotificationInput, 'userId'>
  ): Promise<void> {
    // Send to each user independently
    // We use Promise.allSettled so one failure does not stop others
    await Promise.allSettled(
      userIds.map((userId) => this.sendNotification({ ...input, userId }))
    );
  }

  // Get notifications for the authenticated user
  async getUserNotifications(
    userId: string,
    page?: string,
    limit?: string,
    status?: string
  ) {
    const params = getPaginationParams(page, limit);

    const where: any = {
      userId,
      // Only return non-expired notifications
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (status) {
      where.status = status as NotificationStatus;
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          status: true,
          referenceId: true,
          referenceType: true,
          isSent: true,
          readAt: true,
          createdAt: true,
        },
      }),
      db.notification.count({ where }),
    ]);

    return buildPaginatedResponse(notifications, total, params);
  }

  // Get unread notification count — for the badge on the mobile app
  async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  // Mark a single notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true, status: true },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Users can only mark their own notifications as read
    if (notification.userId !== userId) {
      throw new AppError(
        'You do not have permission to update this notification',
        403
      );
    }

    if (notification.status === NotificationStatus.READ) {
      return notification;
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        readAt: true,
      },
    });

    return updated;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<number> {
    const result = await db.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    logger.info(
      `Marked ${result.count} notifications as read for user: ${userId}`
    );

    return result.count;
  }

  // Archive a notification — user dismisses it
  async archiveNotification(notificationId: string, userId: string) {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError(
        'You do not have permission to update this notification',
        403
      );
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.ARCHIVED },
    });
  }

  // Cleanup expired notifications — called by cron job
  async cleanupExpiredNotifications(): Promise<{
    archived: number;
    deleted: number;
  }> {
    const now = new Date();

    // Archive UNREAD notifications older than 30 days
    const archived = await db.notification.updateMany({
      where: {
        status: NotificationStatus.UNREAD,
        createdAt: {
          lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      data: { status: NotificationStatus.ARCHIVED },
    });

    // Delete READ notifications older than 14 days
    const deletedRead = await db.notification.deleteMany({
      where: {
        status: NotificationStatus.READ,
        readAt: {
          lt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Delete ARCHIVED notifications older than 7 days
    const deletedArchived = await db.notification.deleteMany({
      where: {
        status: NotificationStatus.ARCHIVED,
        createdAt: {
          lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalDeleted = deletedRead.count + deletedArchived.count;

    logger.info(
      `Notification cleanup: archived ${archived.count}, deleted ${totalDeleted}`
    );

    return { archived: archived.count, deleted: totalDeleted };
  }
}

export default new NotificationService();
