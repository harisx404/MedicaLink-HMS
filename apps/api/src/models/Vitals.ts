import mongoose, { Schema, Document } from 'mongoose';
import { SharedVitals } from '@medicalink/shared';

export interface VitalsDocument extends Omit<SharedVitals, 'id' | '_id'>, Document {
  tenantId: string;
}

const vitalsSchema = new Schema<VitalsDocument>({
  tenantId: { type: String, required: true, index: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  ward: { type: Schema.Types.ObjectId, ref: 'Ward' },
  bed: { type: Schema.Types.ObjectId, ref: 'Bed' },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  bp: { systolic: Number, diastolic: Number },
  pulse: Number,
  temp: Number,
  respRate: Number,
  spO2: Number,
  weight: Number,
  height: Number,
  bloodGlucose: Number,
  urine: String,
  pain: Number,
  newsScore: Number,
  
  timestamp: { type: String, required: true },
  notes: String
}, {
  timestamps: true
});

vitalsSchema.index({ tenantId: 1, patient: 1, timestamp: -1 });

export const getVitalsModel = (connection: mongoose.Connection) => {
  return connection.models.Vitals || connection.model<VitalsDocument>('Vitals', vitalsSchema);
};
