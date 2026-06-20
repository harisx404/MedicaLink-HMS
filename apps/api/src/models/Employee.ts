import mongoose, { Schema, Document } from 'mongoose';
import { SharedEmployee, EmploymentType } from '@medicalink/shared';

export interface IEmployee extends Omit<SharedEmployee, 'id' | '_id' | 'userId' | 'reportingTo'>, Document {
  userId: mongoose.Types.ObjectId;
  reportingTo?: mongoose.Types.ObjectId;
}

const EmployeeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    reportingTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    employment: {
      type: {
        type: String,
        enum: Object.values(EmploymentType),
        required: true,
      },
      joinDate: {
        type: Date,
        required: true,
      },
      probationEnd: Date,
      confirmationDate: Date,
    },
    documents: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
    ],
    bank: {
      accountNumber: String,
      bankName: String,
      ifsc: String,
      accountType: String,
    },
    payroll: {
      basicSalary: { type: Number, default: 0 },
      allowances: {
        hra: { type: Number, default: 0 },
        da: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
      },
      deductions: {
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
      },
    },
    performance: {
      lastReview: Date,
      rating: { type: Number, min: 1, max: 5 },
      kpi: [
        {
          metric: String,
          target: Number,
          actual: Number,
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const getEmployeeModel = (tenantDb: mongoose.Connection): mongoose.Model<IEmployee> => {
  return tenantDb.models.Employee || tenantDb.model<IEmployee>('Employee', EmployeeSchema);
};
