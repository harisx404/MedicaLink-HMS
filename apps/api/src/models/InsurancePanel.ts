import mongoose, { Document, Schema, Model } from 'mongoose';
import { InsurancePanelType } from '@medicalink/shared';

export interface IInsurancePanelDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  type: InsurancePanelType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  empanelledSpecialties: string[];
  discountRate: number;
  billingFormat?: string;
  claimSubmissionMethod?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const insurancePanelSchema = new Schema<IInsurancePanelDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: Object.values(InsurancePanelType), required: true },
  contactPerson: String,
  phone: String,
  email: String,
  empanelledSpecialties: [String],
  discountRate: { type: Number, default: 0, min: 0, max: 100 },
  billingFormat: String,
  claimSubmissionMethod: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

insurancePanelSchema.index({ tenantId: 1, name: 1 });

export const getInsurancePanelModel = (connection: mongoose.Connection): Model<IInsurancePanelDocument> => {
  return connection.models.InsurancePanel || connection.model<IInsurancePanelDocument>('InsurancePanel', insurancePanelSchema);
};
