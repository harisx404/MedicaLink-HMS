import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILabResultDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  labOrder: mongoose.Types.ObjectId;
  test: mongoose.Types.ObjectId;
  parameters: Array<{
    name: string;
    value: string;
    unit?: string;
    isAbnormal: boolean;
    isCritical: boolean;
    referenceRange?: {
      min?: number;
      max?: number;
      normalText?: string;
    };
    criticalAcknowledged?: boolean;
    criticalAcknowledgedBy?: mongoose.Types.ObjectId;
    criticalAcknowledgedAt?: Date;
  }>;
  interpretation?: string;
  comments?: string;
  performedBy?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  performedAt?: Date;
  verifiedAt?: Date;
  reportedAt?: Date;
  reportPdfUrl?: string;
  status: 'PENDING' | 'ENTERED' | 'VERIFIED' | 'REPORTED';
  hasDeltaCheck?: boolean;
  deltaWarning?: string;
  createdAt: Date;
  updatedAt: Date;
}

const labResultSchema = new Schema<ILabResultDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  labOrder: {
    type: Schema.Types.ObjectId,
    ref: 'LabOrder',
    required: true,
    index: true
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: 'TestCatalog',
    required: true
  },
  parameters: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: String,
    isAbnormal: { type: Boolean, default: false },
    isCritical: { type: Boolean, default: false },
    referenceRange: {
      min: Number,
      max: Number,
      normalText: String
    },
    criticalAcknowledged: { type: Boolean, default: false },
    criticalAcknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    criticalAcknowledgedAt: Date
  }],
  interpretation: String,
  comments: String,
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  performedAt: Date,
  verifiedAt: Date,
  reportedAt: Date,
  reportPdfUrl: String,
  status: {
    type: String,
    enum: ['PENDING', 'ENTERED', 'VERIFIED', 'REPORTED'],
    default: 'PENDING'
  },
  hasDeltaCheck: { type: Boolean, default: false },
  deltaWarning: String
}, {
  timestamps: true
});

// Compound index for querying results by order
labResultSchema.index({ tenantId: 1, labOrder: 1 });
labResultSchema.index({ tenantId: 1, status: 1 });

export const getLabResultModel = (connection: mongoose.Connection): Model<ILabResultDocument> => {
  return connection.models.LabResult || connection.model<ILabResultDocument>('LabResult', labResultSchema);
};
