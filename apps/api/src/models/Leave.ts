import mongoose, { Schema, Document } from 'mongoose';
import { SharedLeave, LeaveType, LeaveStatus } from '@medicalink/shared';

export interface ILeave extends Omit<SharedLeave, 'id' | '_id' | 'employee' | 'approvedBy'>, Document {
  employee: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
}

const LeaveSchema = new Schema(
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
    leaveType: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approverComment: String,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const getLeaveModel = (tenantDb: mongoose.Connection): mongoose.Model<ILeave> => {
  return tenantDb.models.Leave || tenantDb.model<ILeave>('Leave', LeaveSchema);
};
