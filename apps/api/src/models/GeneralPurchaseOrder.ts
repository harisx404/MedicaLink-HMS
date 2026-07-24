import mongoose, { Schema, Document, Model } from 'mongoose';
import { GeneralPurchaseOrderStatus } from '@medicalink/shared';

export interface GeneralPurchaseOrderDocument extends Document {
  poNumber: string;
  vendor: mongoose.Types.ObjectId | string;
  items: Array<{
    item: mongoose.Types.ObjectId | string;
    quantity: number;
    unitRate: number;
    total: number;
  }>;
  totalAmount: number;
  status: GeneralPurchaseOrderStatus;
  requestedBy: mongoose.Types.ObjectId | string;
  approvedBy?: mongoose.Types.ObjectId | string;
  orderedAt?: Date;
  expectedDelivery?: Date;
  tenantId: string;
}

export type GeneralPurchaseOrderModel = Model<GeneralPurchaseOrderDocument>;

const generalPurchaseOrderItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitRate: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const generalPurchaseOrderSchema = new Schema<GeneralPurchaseOrderDocument>(
  {
    poNumber: { type: String, required: true, unique: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    items: [generalPurchaseOrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: Object.values(GeneralPurchaseOrderStatus), 
      default: GeneralPurchaseOrderStatus.DRAFT, 
      index: true 
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    orderedAt: { type: Date },
    expectedDelivery: { type: Date },
    tenantId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

export const getGeneralPurchaseOrderModel = (connection: mongoose.Connection): GeneralPurchaseOrderModel => {
  return (connection.models.GeneralPurchaseOrder as GeneralPurchaseOrderModel) || connection.model<GeneralPurchaseOrderDocument, GeneralPurchaseOrderModel>('GeneralPurchaseOrder', generalPurchaseOrderSchema);
};
