import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDispensing, DispensingStatus } from '@medicalink/shared';

export interface DispensingDocument extends Omit<IDispensing, '_id' | 'id' | 'dispensedAt' | 'returnedAt'>, Document {
  dispensedAt?: Date;
  returnedAt?: Date;
}

export interface DispensingModel extends Model<DispensingDocument> {
  // Add static methods if needed later
}

const dispensingItemSchema = new Schema({
  drug: { type: Schema.Types.ObjectId, ref: 'Drug', required: true },
  batch: { type: Schema.Types.ObjectId, ref: 'DrugBatch', required: true },
  quantity: { type: Number, required: true, min: 1 },
  dose: { type: String, trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  instructions: { type: String, trim: true }
});

const dispensingSchema = new Schema<DispensingDocument>(
  {
    dispensingNumber: { type: String, required: true, unique: true },
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    dispensedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [dispensingItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dispensedAt: { type: Date, default: Date.now, index: true },
    returnedAt: { type: Date },
    status: { type: String, enum: Object.values(DispensingStatus), default: DispensingStatus.PENDING, index: true }
  },
  { timestamps: true }
);

export const getDispensingModel = (connection: mongoose.Connection): DispensingModel => {
  return (connection.models.Dispensing as DispensingModel) || connection.model<DispensingDocument, DispensingModel>('Dispensing', dispensingSchema);
};
