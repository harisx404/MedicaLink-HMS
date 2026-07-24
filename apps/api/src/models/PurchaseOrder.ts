import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPurchaseOrder, PurchaseOrderStatus } from '@medicalink/shared';

export interface PurchaseOrderDocument extends Omit<IPurchaseOrder, '_id' | 'id' | 'orderedAt' | 'expectedDelivery'>, Document {
  orderedAt: Date;
  expectedDelivery?: Date;
}

export type PurchaseOrderModel = Model<PurchaseOrderDocument>;

const purchaseOrderItemSchema = new Schema({
  drug: { type: Schema.Types.ObjectId, ref: 'Drug', required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new Schema<PurchaseOrderDocument>(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    items: [purchaseOrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(PurchaseOrderStatus), default: PurchaseOrderStatus.DRAFT, index: true },
    orderedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderedAt: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    goodsReceiptNotes: [{ type: Schema.Types.ObjectId, ref: 'GoodsReceiptNote' }]
  },
  { timestamps: true }
);

export const getPurchaseOrderModel = (connection: mongoose.Connection): PurchaseOrderModel => {
  return (connection.models.PurchaseOrder as PurchaseOrderModel) || connection.model<PurchaseOrderDocument, PurchaseOrderModel>('PurchaseOrder', purchaseOrderSchema);
};
