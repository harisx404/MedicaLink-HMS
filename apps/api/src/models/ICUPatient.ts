import mongoose, { Schema, Document, Connection, Model } from 'mongoose';
import { IICUPatient } from '@medicalink/shared';

const ICUVitalEntrySchema = new Schema({
  time: { type: Date, required: true },
  bp: { type: String, required: true },
  hr: { type: Number, required: true },
  temp: { type: Number, required: true },
  spO2: { type: Number, required: true },
  rr: { type: Number, required: true },
  cvp: { type: Number },
  map: { type: Number }
}, { _id: false });

const FluidBalanceSchema = new Schema({
  date: { type: Date, required: true },
  input: {
    oral: { type: Number, default: 0 },
    iv: { type: Number, default: 0 },
    blood: { type: Number, default: 0 }
  },
  output: {
    urine: { type: Number, default: 0 },
    drain: { type: Number, default: 0 },
    nasogastric: { type: Number, default: 0 }
  },
  balance: { type: Number, default: 0 }
}, { _id: false });

const ICUVentilatorSchema = new Schema({
  isOnVentilator: { type: Boolean, default: false },
  mode: { type: String },
  fiO2: { type: Number },
  peep: { type: Number },
  tv: { type: Number },
  rr: { type: Number },
  settings: { type: Schema.Types.Mixed },
  updatedAt: { type: Date }
}, { _id: false });

const ICULineSchema = new Schema({
  type: { type: String, enum: ['CENTRAL', 'ARTERIAL', 'PERIPHERAL', 'FOLEY'], required: true },
  insertedAt: { type: Date, required: true },
  site: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'REMOVED'], default: 'ACTIVE' },
  removedAt: { type: Date }
});

const ICUInfusionSchema = new Schema({
  drug: { type: String, required: true },
  concentration: { type: String, required: true },
  rate: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date }
});

const ICUPatientSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  ward: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
  bed: { type: Schema.Types.ObjectId, ref: 'Bed', required: true },
  admittedAt: { type: Date, required: true, default: Date.now },
  admittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  admissionDiagnosis: { type: String, required: true },
  apacheScore: { type: Number },
  sofaScore: { type: Number },
  
  ventilator: { type: ICUVentilatorSchema, default: () => ({}) },
  hourlyVitals: [ICUVitalEntrySchema],
  fluidBalance: [FluidBalanceSchema],
  lines: [ICULineSchema],
  infusions: [ICUInfusionSchema],

  isActive: { type: Boolean, default: true },
  dischargedAt: { type: Date }
}, { timestamps: true });

export const getICUPatientModel = (tenantDb: Connection): Model<IICUPatient & Document> => {
  return tenantDb.models.ICUPatient || tenantDb.model<IICUPatient & Document>('ICUPatient', ICUPatientSchema);
};
