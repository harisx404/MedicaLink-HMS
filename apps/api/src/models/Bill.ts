import mongoose, { Document, Schema, Model } from 'mongoose';
import { BillStatus, BillType, BillItemCategory, PaymentMode, InsuranceClaimStatus } from '@medicalink/shared';

export interface IBillDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  billNumber: string;
  patient: mongoose.Types.ObjectId;
  encounter?: mongoose.Types.ObjectId;
  billType: BillType;
  billDate: Date;

  items: Array<{
    category: BillItemCategory;
    description: string;
    refId?: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    discountPct: number;
    taxRate: number;
    amount: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    total: number;
    performedBy?: mongoose.Types.ObjectId;
    serviceDate?: Date;
  }>;

  // Totals
  grossAmount: number;
  discountAmount: number;
  discountReason?: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  roundOff: number;
  netAmount: number;

  // Payments
  payments: Array<{
    mode: PaymentMode;
    amount: number;
    reference?: string;
    date: Date;
    receivedBy?: mongoose.Types.ObjectId;
  }>;
  totalPaid: number;
  balance: number;

  // Insurance
  insuranceClaim?: {
    insuranceId?: mongoose.Types.ObjectId;
    policyNumber?: string;
    tpaName?: string;
    preAuthNumber?: string;
    preAuthDate?: Date;
    preAuthAmount?: number;
    claimNumber?: string;
    claimDate?: Date;
    claimedAmount?: number;
    approvedAmount?: number;
    settledAmount?: number;
    rejectionReason?: string;
    status: InsuranceClaimStatus;
  };

  status: BillStatus;
  voidReason?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  creditNoteRef?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const billItemSchema = new Schema({
  category: { type: String, enum: Object.values(BillItemCategory), required: true },
  description: { type: String, required: true, trim: true },
  refId: { type: Schema.Types.ObjectId },
  quantity: { type: Number, required: true, min: 0.01 },
  unitPrice: { type: Number, required: true, min: 0 },
  discountPct: { type: Number, default: 0, min: 0, max: 100 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  amount: { type: Number, required: true },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  serviceDate: { type: Date }
}, { _id: true });

const paymentSchema = new Schema({
  mode: { type: String, enum: Object.values(PaymentMode), required: true },
  amount: { type: Number, required: true, min: 0.01 },
  reference: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const insuranceClaimSchema = new Schema({
  insuranceId: { type: Schema.Types.ObjectId },
  policyNumber: String,
  tpaName: String,
  preAuthNumber: String,
  preAuthDate: Date,
  preAuthAmount: Number,
  claimNumber: String,
  claimDate: Date,
  claimedAmount: Number,
  approvedAmount: Number,
  settledAmount: Number,
  rejectionReason: String,
  status: {
    type: String,
    enum: Object.values(InsuranceClaimStatus),
    default: InsuranceClaimStatus.PENDING
  }
}, { _id: false });

const billSchema = new Schema<IBillDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  billNumber: { type: String, required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  encounter: { type: Schema.Types.ObjectId, ref: 'Consultation' },
  billType: { type: String, enum: Object.values(BillType), required: true },
  billDate: { type: Date, default: Date.now },

  items: [billItemSchema],

  grossAmount: { type: Number, required: true, default: 0 },
  discountAmount: { type: Number, default: 0 },
  discountReason: String,
  taxableAmount: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  netAmount: { type: Number, required: true, default: 0 },

  payments: [paymentSchema],
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  insuranceClaim: insuranceClaimSchema,

  status: {
    type: String,
    enum: Object.values(BillStatus),
    default: BillStatus.DRAFT
  },
  voidReason: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  creditNoteRef: { type: Schema.Types.ObjectId, ref: 'CreditNote' }
}, { timestamps: true });

// Indexes
billSchema.index({ tenantId: 1, billNumber: 1 }, { unique: true });
billSchema.index({ tenantId: 1, patient: 1 });
billSchema.index({ tenantId: 1, status: 1 });
billSchema.index({ tenantId: 1, billDate: -1 });
billSchema.index({ tenantId: 1, 'insuranceClaim.status': 1 });

export const getBillModel = (connection: mongoose.Connection): Model<IBillDocument> => {
  return connection.models.Bill || connection.model<IBillDocument>('Bill', billSchema);
};
