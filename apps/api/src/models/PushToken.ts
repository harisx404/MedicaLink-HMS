import mongoose, { Schema, Document, Connection, Model } from 'mongoose';

export interface IPushToken {
  tenantId: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: Date;
  updatedAt: Date;
}

const PushTokenSchema = new Schema({
  tenantId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  platform: { type: String, enum: ['ios', 'android', 'web'], required: true, default: 'ios' }
}, { timestamps: true });

// Create a compound unique index so a device token is unique per user
PushTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

export const getPushTokenModel = (connection: Connection): Model<IPushToken & Document> => {
  return connection.models.PushToken || connection.model<IPushToken & Document>('PushToken', PushTokenSchema);
};
