import mongoose, { Schema, Document, Model } from 'mongoose';
import { IGoodsReceiptNote } from '@medicalink/shared';

export interface GoodsReceiptNoteDocument extends Omit<IGoodsReceiptNote, '_id' | 'id' | 'createdAt'>, Document {
  createdAt?: Date;
}

export type GoodsReceiptNoteModel = Model<GoodsReceiptNoteDocument>;

const grnItemSchema = new Schema({
  drug: { type: Schema.Types.ObjectId, ref: 'Drug', required: true },
  receivedQty: { type: Number, required: true, min: 0 },
  batchNumber: { type: String, required: true, trim: true },
  expiryDate: { type: Date, required: true },
  rackLocation: { type: String, trim: true }
});

const goodsReceiptNoteSchema = new Schema<GoodsReceiptNoteDocument>(
  {
    grnNumber: { type: String, required: true, unique: true },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [grnItemSchema],
    discrepancies: { type: String, trim: true },
    status: { type: String, default: 'COMPLETED' }
  },
  { timestamps: true }
);

export const getGoodsReceiptNoteModel = (connection: mongoose.Connection): GoodsReceiptNoteModel => {
  return (connection.models.GoodsReceiptNote as GoodsReceiptNoteModel) || connection.model<GoodsReceiptNoteDocument, GoodsReceiptNoteModel>('GoodsReceiptNote', goodsReceiptNoteSchema);
};
