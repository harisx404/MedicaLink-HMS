import mongoose from 'mongoose';
import { 
  NotificationType, 
  NotificationChannel, 
  NotificationPriority,
  SendNotificationPayload,
  NotificationCategory
} from '@medicalink/shared';
import { getNotificationModel } from '../models/Notification';
import { getNotificationTemplateModel } from '../models/NotificationTemplate';
import { getUserModel } from '../models/User';
import { notificationQueue } from '../jobs/notificationJobs';
import { getSocketServer, emitToUser } from '../sockets';
import { logger } from '../utils/logger';

export class NotificationService {
  /**
   * Send a notification to a specific user
   */
  static async sendNotification(tenantDb: mongoose.Connection, tenantId: string, payload: SendNotificationPayload) {
    const { userId, type, title, body, category, priority, channels, data } = payload;
    
    const Notification = getNotificationModel(tenantDb);
    const NotificationTemplate = getNotificationTemplateModel(tenantDb);
    const User = getUserModel(tenantDb);

    // Default channels if not specified
    const targetChannels = channels && channels.length > 0 
      ? channels 
      : [NotificationChannel.INAPP];

    // Determine category if not explicitly provided
    const resolvedCategory = category || this.determineCategory(type);

    // Create Notification Record
    const notification = await Notification.create({
      tenantId,
      userId,
      type,
      category: resolvedCategory,
      title,
      body,
      channels: targetChannels,
      priority: priority || NotificationPriority.NORMAL,
      data,
      status: {
        inApp: targetChannels.includes(NotificationChannel.INAPP) ? { sent: false } : undefined,
        email: targetChannels.includes(NotificationChannel.EMAIL) ? { sent: false } : undefined,
        sms: targetChannels.includes(NotificationChannel.SMS) ? { sent: false } : undefined
      }
    });

    // 1. In-App: Send immediately via Socket.io
    if (targetChannels.includes(NotificationChannel.INAPP)) {
      try {
        emitToUser(userId, 'NEW_NOTIFICATION', notification);
        notification.status.inApp = { sent: true };
        await notification.save();
      } catch (error) {
        logger.error(`[NotificationService] Socket emit failed for user ${userId}:`, error);
      }
    }

    // 2. Queue Email & SMS jobs
    const hasExternalChannels = targetChannels.some(c => 
      c === NotificationChannel.EMAIL || c === NotificationChannel.SMS
    );

    if (hasExternalChannels) {
      // Find template
      const template = await NotificationTemplate.findOne({
        tenantId,
        notificationType: type,
        isActive: true
      });

      const user = await User.findById(userId).select('email phone');

      if (user) {
        // Add to BullMQ for asynchronous processing
        await notificationQueue.add(
          'process-notification',
          {
            notificationId: notification._id.toString(),
            tenantId,
            userId,
            email: user.email,
            phone: user.phone,
            title,
            body,
            templateId: template?._id.toString(),
            channels: targetChannels
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true
          }
        );
      }
    }

    return notification;
  }

  /**
   * Helper to map NotificationType to NotificationCategory
   */
  private static determineCategory(type: NotificationType): NotificationCategory {
    if (type.startsWith('LAB_') || type.startsWith('PRESCRIPTION_') || type.startsWith('BLOOD_')) {
      return NotificationCategory.CLINICAL;
    }
    if (type.startsWith('APPOINTMENT_')) {
      return NotificationCategory.REMINDER;
    }
    if (type.startsWith('BILL_') || type.startsWith('PAYMENT_')) {
      return NotificationCategory.BILLING;
    }
    if (type.startsWith('SYSTEM_')) {
      return NotificationCategory.SYSTEM;
    }
    return NotificationCategory.ADMINISTRATIVE;
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(tenantDb: mongoose.Connection, tenantId: string, userId: string, notificationIds?: string[]) {
    const Notification = getNotificationModel(tenantDb);
    const query: any = { tenantId, userId, isRead: false };
    
    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    await Notification.updateMany(query, {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    });
  }
}
