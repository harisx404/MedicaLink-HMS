import mongoose, { Schema, Document, Types } from 'mongoose';
import { SharedCompliance, ComplianceFramework, ComplianceStatus } from '@medicalink/shared';

export interface ICompliance extends Document, Omit<SharedCompliance, '_id' | 'tenantId' | 'evidenceDocumentIds' | 'createdAt' | 'updatedAt'> {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  evidenceDocumentIds: Types.ObjectId[];
}

const complianceSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  framework: { type: String, enum: Object.values(ComplianceFramework), required: true },
  category: { type: String, required: true },
  requirement: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: Object.values(ComplianceStatus), default: ComplianceStatus.IN_PROGRESS },
  evidenceDocumentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  lastReviewedAt: { type: Date },
  nextReviewDate: { type: Date },
  reviewedBy: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

export const getComplianceModel = (tenantDb: mongoose.Connection): mongoose.Model<ICompliance> => {
  return tenantDb.model<ICompliance>('Compliance', complianceSchema);
};
