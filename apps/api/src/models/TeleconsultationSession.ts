import mongoose, { Schema, Document, Connection, Model } from 'mongoose';
import { ITeleconsultationSession, TeleconsultationStatus } from '@medicalink/shared';

const TeleconsultationSessionSchema = new Schema({
  tenantId: { type: String, required: true },
  appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  patient: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    token: { type: String }
  },
  doctor: {
    userId: { type: String, required: true },
    name: { type: String, required: true }
  },
  scheduledAt: { type: Date, required: true },
  actualStartAt: { type: Date },
  actualEndAt: { type: Date },
  duration: { type: Number },
  techStats: {
    quality: { type: String },
    issues: { type: String }
  },
  consultation: { type: Schema.Types.ObjectId, ref: 'Consultation' },
  recordingUrl: { type: String },
  status: { 
    type: String, 
    enum: Object.values(TeleconsultationStatus), 
    default: TeleconsultationStatus.WAITING 
  }
}, { timestamps: true });

export const getTeleconsultationSessionModel = (connection: Connection): Model<ITeleconsultationSession & Document> => {
  return connection.models.TeleconsultationSession || connection.model<ITeleconsultationSession & Document>('TeleconsultationSession', TeleconsultationSessionSchema);
};
