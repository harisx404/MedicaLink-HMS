import mongoose, { Schema, Document, Types, Model, Connection } from 'mongoose';
import { NotificationType, NotificationChannel } from '@medicalink/shared';

export interface INotificationTemplate extends Document {
  tenantId: Types.ObjectId;
  notificationType: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    notificationType: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true
    },
    subject: {
      type: String
    },
    body: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one template per type per channel per tenant
notificationTemplateSchema.index({ tenantId: 1, notificationType: 1, channel: 1 }, { unique: true });

export const getNotificationTemplateModel = (tenantDb: Connection): Model<INotificationTemplate> => {
  return tenantDb.models.NotificationTemplate || tenantDb.model<INotificationTemplate>('NotificationTemplate', notificationTemplateSchema);
};
