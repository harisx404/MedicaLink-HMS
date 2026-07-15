import mongoose, { Schema, Document, Types } from 'mongoose';
import { SharedConsent, ConsentType } from '@medicalink/shared';

export interface IConsent extends Document, Omit<SharedConsent, '_id' | 'tenantId' | 'patientId' | 'procedureId' | 'witnessByStaffId' | 'createdAt' | 'updatedAt'> {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  patientId: Types.ObjectId;
  procedureId?: Types.ObjectId;
  witnessByStaffId?: Types.ObjectId;
}

const consentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  procedureId: { type: Schema.Types.ObjectId, ref: 'Surgery' }, // Reference to a generic procedure or surgery
  consentType: { type: String, enum: Object.values(ConsentType), required: true },
  content: { type: String, required: true },
  isSigned: { type: Boolean, default: false },
  signedAt: { type: Date },
  signedBy: { type: String },
  signatureData: { type: String }, // Base64
  witnessByStaffId: { type: Schema.Types.ObjectId, ref: 'User' },
  isRevoked: { type: Boolean, default: false },
  revokedAt: { type: Date },
  revokedReason: { type: String }
}, {
  timestamps: true
});

export const getConsentModel = (tenantDb: mongoose.Connection): mongoose.Model<IConsent> => {
  return tenantDb.model<IConsent>('Consent', consentSchema);
};
