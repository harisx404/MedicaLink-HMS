import mongoose, { Schema, Document } from 'mongoose';
import { SharedPayroll, PayrollStatus } from '@medicalink/shared';

export interface IPayroll extends Omit<SharedPayroll, 'id' | '_id' | 'employee' | 'processedBy'>, Document {
  employee: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId;
}

const PayrollSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true, // 1 to 12
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true, // e.g. 2026
    },
    earnings: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      da: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      overtime: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      advance: { type: Number, default: 0 },
      loan: { type: Number, default: 0 },
    },
    grossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(PayrollStatus),
      default: PayrollStatus.DRAFT,
    },
    payslipUrl: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const getPayrollModel = (tenantDb: mongoose.Connection): mongoose.Model<IPayroll> => {
  return tenantDb.models.Payroll || tenantDb.model<IPayroll>('Payroll', PayrollSchema);
};
