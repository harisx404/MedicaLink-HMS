import mongoose, { Document, Schema, Model } from 'mongoose';
import { LabOrderStatus } from '@medicalink/shared';

export interface ILabOrderDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  orderNumber: string; // LAB-YYYYMMDD-NNNN
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  consultation?: mongoose.Types.ObjectId;
  tests: Array<{
    testId: mongoose.Types.ObjectId;
    testName: string;
    status: LabOrderStatus;
    priority: 'ROUTINE' | 'URGENT' | 'STAT';
  }>;
  urgency: 'ROUTINE' | 'URGENT' | 'STAT';
  clinicalInfo?: string;
  orderDate: Date;
  sampleBarcode?: string;
  collectedBy?: mongoose.Types.ObjectId;
  collectedAt?: Date;
  status: LabOrderStatus;
  
  // TAT Tracking
  orderedAt: Date;
  resultEnteredAt?: Date;
  verifiedAt?: Date;
  reportedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const labOrderSchema = new Schema<ILabOrderDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  consultation: {
    type: Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  tests: [{
    testId: { type: Schema.Types.ObjectId, ref: 'TestCatalog', required: true },
    testName: { type: String, required: true },
    status: { 
      type: String, 
      enum: Object.values(LabOrderStatus),
      default: LabOrderStatus.ORDERED
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'STAT'],
      default: 'ROUTINE'
    }
  }],
  urgency: {
    type: String,
    enum: ['ROUTINE', 'URGENT', 'STAT'],
    default: 'ROUTINE'
  },
  clinicalInfo: String,
  orderDate: {
    type: Date,
    default: Date.now
  },
  sampleBarcode: String,
  collectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  collectedAt: Date,
  status: {
    type: String,
    enum: Object.values(LabOrderStatus),
    default: LabOrderStatus.ORDERED
  },
  orderedAt: {
    type: Date,
    default: Date.now
  },
  resultEnteredAt: Date,
  verifiedAt: Date,
  reportedAt: Date
}, {
  timestamps: true
});

// Indexes
labOrderSchema.index({ tenantId: 1, status: 1 });
labOrderSchema.index({ tenantId: 1, orderDate: -1 });
labOrderSchema.index({ sampleBarcode: 1 }, { sparse: true });

export const getLabOrderModel = (connection: mongoose.Connection): Model<ILabOrderDocument> => {
  return connection.models.LabOrder || connection.model<ILabOrderDocument>('LabOrder', labOrderSchema);
};
