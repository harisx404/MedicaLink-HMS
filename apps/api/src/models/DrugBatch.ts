import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDrugBatch } from '@medicalink/shared';

export interface DrugBatchDocument extends Omit<IDrugBatch, '_id' | 'id' | 'expiryDate' | 'manufacturingDate' | 'purchaseDate'>, Document {
  expiryDate: Date;
  manufacturingDate?: Date;
  purchaseDate?: Date;
}

export interface DrugBatchModel extends Model<DrugBatchDocument> {
  findActiveBatches(drugId: string): Promise<DrugBatchDocument[]>;
}

const drugBatchSchema = new Schema<DrugBatchDocument>(
  {
    drug: { type: Schema.Types.ObjectId, ref: 'Drug', required: true, index: true },
    batchNumber: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    manufacturingDate: { type: Date },
    purchaseDate: { type: Date },
    quantity: { type: Number, required: true, min: 0 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    purchaseRate: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    rackLocation: { type: String, trim: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' }
  },
  { timestamps: true }
);

// Indexes
// Compound index for FEFO (First Expiry First Out) sorting
drugBatchSchema.index({ drug: 1, expiryDate: 1 });
// Unique constraint on drug + batchNumber to prevent duplicates
drugBatchSchema.index({ drug: 1, batchNumber: 1 }, { unique: true });

drugBatchSchema.statics.findActiveBatches = function (drugId: string): Promise<DrugBatchDocument[]> {
  return this.find({ 
    drug: drugId,
    remainingQuantity: { $gt: 0 },
    expiryDate: { $gt: new Date() } // Only non-expired batches
  }).sort({ expiryDate: 1 }); // Sort ascending for FEFO
};

export const getDrugBatchModel = (connection: mongoose.Connection): DrugBatchModel => {
  return (connection.models.DrugBatch as DrugBatchModel) || connection.model<DrugBatchDocument, DrugBatchModel>('DrugBatch', drugBatchSchema);
};
