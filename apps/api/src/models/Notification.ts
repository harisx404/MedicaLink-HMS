import mongoose, { Schema, Document, Types, Model, Connection } from 'mongoose';
import { NotificationType, NotificationCategory, NotificationPriority, NotificationChannel } from '@medicalink/shared';

export interface INotification extends Document {
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  status: {
    inApp?: { sent: boolean; readAt?: Date | null };
    email?: { sent: boolean; deliveredAt?: Date | null; error?: string };
    sms?: { sent: boolean; deliveredAt?: Date | null; error?: string };
  };
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date | null;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    category: {
      type: String,
      enum: Object.values(NotificationCategory),
      required: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    data: {
      type: Schema.Types.Mixed
    },
    channels: [{
      type: String,
      enum: Object.values(NotificationChannel)
    }],
    status: {
      inApp: {
        sent: { type: Boolean, default: false },
        readAt: { type: Date }
      },
      email: {
        sent: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        error: { type: String }
      },
      sms: {
        sent: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        error: { type: String }
      }
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const getNotificationModel = (tenantDb: Connection): Model<INotification> => {
  return tenantDb.models.Notification || tenantDb.model<INotification>('Notification', notificationSchema);
};
