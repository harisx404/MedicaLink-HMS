import mongoose, { Schema, Document } from 'mongoose';
import { SharedAttendance, AttendanceStatus, AttendanceMethod } from '@medicalink/shared';

export interface IAttendance extends Omit<SharedAttendance, 'id' | '_id' | 'employee'>, Document {
  employee: mongoose.Types.ObjectId;
}

const AttendanceSchema = new Schema(
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
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    checkIn: {
      time: Date,
      location: {
        lat: Number,
        lng: Number,
      },
      method: {
        type: String,
        enum: Object.values(AttendanceMethod),
      },
    },
    checkOut: {
      time: Date,
      location: {
        lat: Number,
        lng: Number,
      },
      method: {
        type: String,
        enum: Object.values(AttendanceMethod),
      },
    },
    workingHours: Number,
    overtimeHours: Number,
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    notes: String,
    regularizationRequest: {
      reason: String,
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure one attendance record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const getAttendanceModel = (tenantDb: mongoose.Connection): mongoose.Model<IAttendance> => {
  return tenantDb.models.Attendance || tenantDb.model<IAttendance>('Attendance', AttendanceSchema);
};
