import mongoose, { Document, Schema, Model } from 'mongoose';
import { CreditNoteStatus } from '@medicalink/shared';

export interface ICreditNoteDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  creditNoteNumber: string;
  originalBill: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  issuedBy?: mongoose.Types.ObjectId;
  issuedAt: Date;
  status: CreditNoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const creditNoteSchema = new Schema<ICreditNoteDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  creditNoteNumber: { type: String, required: true },
  originalBill: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true, trim: true },
  issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  issuedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: Object.values(CreditNoteStatus),
    default: CreditNoteStatus.PENDING
  }
}, { timestamps: true });

creditNoteSchema.index({ tenantId: 1, creditNoteNumber: 1 }, { unique: true });
creditNoteSchema.index({ tenantId: 1, patient: 1 });

export const getCreditNoteModel = (connection: mongoose.Connection): Model<ICreditNoteDocument> => {
  return connection.models.CreditNote || connection.model<ICreditNoteDocument>('CreditNote', creditNoteSchema);
};
