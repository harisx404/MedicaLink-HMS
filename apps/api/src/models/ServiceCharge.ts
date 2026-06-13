import mongoose, { Document, Schema, Model } from 'mongoose';
import { BillItemCategory } from '@medicalink/shared';

export interface IServiceChargeDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  category: BillItemCategory;
  price: number;
  taxRate: number;
  department?: mongoose.Types.ObjectId;
  isPackageable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceChargeSchema = new Schema<IServiceChargeDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: Object.values(BillItemCategory), required: true },
  price: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 18, enum: [0, 5, 12, 18] },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  isPackageable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Unique code per tenant
serviceChargeSchema.index({ tenantId: 1, code: 1 }, { unique: true });
serviceChargeSchema.index({ tenantId: 1, category: 1 });
serviceChargeSchema.index({ tenantId: 1, name: 'text' }); // Text search

export const getServiceChargeModel = (connection: mongoose.Connection): Model<IServiceChargeDocument> => {
  return connection.models.ServiceCharge || connection.model<IServiceChargeDocument>('ServiceCharge', serviceChargeSchema);
};
