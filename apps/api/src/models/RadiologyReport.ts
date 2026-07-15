import mongoose, { Document, Schema, Connection } from 'mongoose';

export interface IRadiologyReport extends Document {
  tenantId: string;
  order: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  technique?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  criticalFindings: boolean;
  dicomStudyId?: mongoose.Types.ObjectId;
  imageUrls?: string[];
  reportedBy?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  reportedAt?: Date;
  verifiedAt?: Date;
  pdfUrl?: string;
  status: 'DRAFT' | 'PENDING_VERIFICATION' | 'FINAL';
  createdAt: Date;
  updatedAt: Date;
}

const radiologyReportSchema = new Schema<IRadiologyReport>(
  {
    tenantId: { type: String, required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'RadiologyOrder', required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    technique: { type: String },
    findings: { type: String, required: true },
    impression: { type: String, required: true },
    recommendations: { type: String },
    criticalFindings: { type: Boolean, default: false },
    dicomStudyId: { type: Schema.Types.ObjectId, ref: 'DicomStudy' },
    imageUrls: [{ type: String }],
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reportedAt: { type: Date },
    verifiedAt: { type: Date },
    pdfUrl: { type: String },
    status: { 
      type: String, 
      enum: ['DRAFT', 'PENDING_VERIFICATION', 'FINAL'], 
      default: 'DRAFT' 
    }
  },
  { timestamps: true }
);

radiologyReportSchema.index({ tenantId: 1, status: 1 });
radiologyReportSchema.index({ tenantId: 1, patient: 1 });

export const getRadiologyReportModel = (connection: Connection) => {
  return connection.model<IRadiologyReport>('RadiologyReport', radiologyReportSchema);
};
