import mongoose, { Schema, Document } from 'mongoose';
import { SharedConsultation } from '@medicalink/shared';

export interface ConsultationDocument extends Omit<SharedConsultation, 'id' | '_id'>, Document {
  tenantId: string;
}

const consultationSchema = new Schema<ConsultationDocument>({
  tenantId: { type: String, required: true, index: true },
  consultationNumber: { type: String, required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  visitDate: { type: String, required: true },
  visitType: { type: String, enum: ['OPD', 'IPD', 'EMERGENCY', 'TELEMEDICINE'], required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  
  subjective: {
    symptoms: [{
      symptom: String,
      duration: String,
      severity: String,
      notes: String
    }],
    reviewOfSystems: { type: Map, of: String }
  },
  
  objective: {
    vitals: {
      bp: { systolic: Number, diastolic: Number },
      pulse: Number,
      temperature: Number,
      respRate: Number,
      spO2: Number,
      weight: Number,
      height: Number,
      bmi: Number,
      painScore: Number,
      bloodGlucose: Number
    },
    physicalExam: { type: Map, of: String },
    anthropometry: { waistCircumference: Number, hipCircumference: Number }
  },
  
  assessment: {
    diagnoses: [{
      icdCode: String,
      description: String,
      type: { type: String, enum: ['PRIMARY', 'SECONDARY', 'COMORBIDITY'] },
      severity: String,
      status: { type: String, enum: ['PROVISIONAL', 'CONFIRMED', 'DIFFERENTIAL'] }
    }],
    clinicalNotes: String,
    aiSummary: String
  },
  
  plan: {
    prescriptions: [{ type: Schema.Types.ObjectId, ref: 'Prescription' }],
    labOrders: [{ type: String }],
    radiologyOrders: [{ type: String }],
    procedures: [{ name: String, notes: String, scheduledDate: String }],
    referrals: [{ speciality: String, doctorName: String, urgency: String, notes: String }],
    instructions: String,
    followUpDate: String,
    followUpReason: String,
    sickLeave: { days: Number, fromDate: String, toDate: String, reason: String }
  },
  
  consultationFee: { type: Number },
  status: { type: String, enum: ['DRAFT', 'COMPLETED', 'SIGNED'], default: 'DRAFT' },
  signedAt: { type: String },
  signedBy: { type: String }
}, {
  timestamps: true
});

// Create compound indexes for faster searching (Phase 19 Performance Optimization)
consultationSchema.index({ patient: 1, visitDate: -1 });
consultationSchema.index({ tenantId: 1, patient: 1 });
consultationSchema.index({ tenantId: 1, doctor: 1 });
consultationSchema.index({ tenantId: 1, consultationNumber: 1 }, { unique: true });

// Prevent model overwrite in development/serverless
export const getConsultationModel = (connection: mongoose.Connection) => {
  return connection.models.Consultation || connection.model<ConsultationDocument>('Consultation', consultationSchema);
};
