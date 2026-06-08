import mongoose, { Schema, Document, Connection, Model } from 'mongoose';
import { getCounterModel } from './Counter';

export interface AppointmentDocument extends Document {
  appointmentNumber: string;
  tenantId: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  appointmentDate: Date;
  timeSlot: { start: string; end: string };
  type: 'OPD' | 'IPD' | 'EMERGENCY' | 'TELEMEDICINE' | 'FOLLOW_UP';
  status: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  tokenNumber: number;
  reasonForVisit: string;
  notes?: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  bookedBy: mongoose.Types.ObjectId;
  bookedAt: Date;
  checkedInAt?: Date;
  consultationStartAt?: Date;
  consultationEndAt?: Date;
  reminders: Array<{
    type: string;
    sentAt?: Date;
    status: string;
  }>;
  cancellation?: {
    reason?: string;
    cancelledBy?: mongoose.Types.ObjectId;
    cancelledAt?: Date;
    refundStatus?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    appointmentNumber: { type: String, unique: true }, // Generated via pre-save hook
    tenantId: { type: String, required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    
    appointmentDate: { type: Date, required: true, index: true },
    timeSlot: {
      start: { type: String, required: true },
      end: { type: String, required: true }
    },
    
    type: { 
      type: String, 
      enum: ['OPD', 'IPD', 'EMERGENCY', 'TELEMEDICINE', 'FOLLOW_UP'],
      default: 'OPD'
    },
    status: { 
      type: String, 
      enum: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'SCHEDULED'
    },
    
    tokenNumber: { type: Number, required: true },
    reasonForVisit: { type: String, required: true },
    notes: { type: String },
    priority: { 
      type: String, 
      enum: ['NORMAL', 'URGENT', 'EMERGENCY'],
      default: 'NORMAL'
    },
    
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookedAt: { type: Date, default: Date.now },
    
    checkedInAt: { type: Date },
    consultationStartAt: { type: Date },
    consultationEndAt: { type: Date },
    
    reminders: [
      {
        type: { type: String },
        sentAt: { type: Date },
        status: { type: String }
      }
    ],
    
    cancellation: {
      reason: { type: String },
      cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
      cancelledAt: { type: Date },
      refundStatus: { type: String }
    }
  },
  { timestamps: true }
);

// Indexes
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ tenantId: 1, status: 1 });

// Pre-save hook to generate appointmentNumber
appointmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.appointmentNumber) {
    try {
      const db = this.db;
      const Counter = getCounterModel(db);
      
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'appointment_num' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      const year = new Date().getFullYear();
      const sequence = counter.seq.toString().padStart(5, '0');
      this.appointmentNumber = `APT-${year}-${sequence}`;
      
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const getAppointmentModel = (tenantDb: Connection): Model<AppointmentDocument> => {
  return tenantDb.models.Appointment || tenantDb.model<AppointmentDocument>('Appointment', appointmentSchema);
};
