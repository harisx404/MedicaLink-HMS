import mongoose, { Schema, Document, Connection, Model } from 'mongoose';
import { IOperationTheater, IOTCase, OTCaseStatus, ProcedureType } from '@medicalink/shared';

const OperationTheaterSchema = new Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. Major, Minor, Cardiac
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'], default: 'AVAILABLE' },
  capabilities: [{ type: String }]
}, { timestamps: true });

const OTChecklistItemSchema = new Schema({
  item: { type: String, required: true },
  status: { type: Boolean, default: false },
  checkedBy: { type: String },
  time: { type: Date }
}, { _id: false });

const OTImplantsSchema = new Schema({
  name: { type: String, required: true },
  lot: { type: String, required: true },
  expiry: { type: Date, required: true },
  size: { type: String }
}, { _id: false });

const OTSuturesSchema = new Schema({
  material: { type: String, required: true },
  size: { type: String, required: true },
  manufacturer: { type: String }
}, { _id: false });

const OTSpecimenSchema = new Schema({
  description: { type: String, required: true },
  disposition: { type: String, required: true }
}, { _id: false });

const OTDrugLogSchema = new Schema({
  drug: { type: String, required: true },
  dose: { type: String, required: true },
  time: { type: Date, required: true }
}, { _id: false });

const OTVitalsSchema = new Schema({
  time: { type: Date, required: true },
  bp: { type: String, required: true },
  hr: { type: Number, required: true },
  spO2: { type: Number, required: true }
}, { _id: false });

const OTCaseSchema = new Schema({
  tenantId: { type: String, required: true },
  caseNumber: { type: String, required: true, unique: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  procedure: {
    name: { type: String, required: true },
    icdProcCode: { type: String },
    type: { type: String, enum: Object.values(ProcedureType), required: true }
  },
  surgeon: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  assistant: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  anesthesiologist: { type: Schema.Types.ObjectId, ref: 'User' },
  anesthesiaType: { type: String },
  scrubNurse: { type: Schema.Types.ObjectId, ref: 'User' },
  circulatingNurse: { type: Schema.Types.ObjectId, ref: 'User' },
  theater: { type: Schema.Types.ObjectId, ref: 'OperationTheater', required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  estimatedDuration: { type: Number, required: true }, // in minutes

  preOp: {
    checklist: [OTChecklistItemSchema],
    consentSigned: { type: Boolean, default: false },
    consentBy: { type: String },
    consentDate: { type: Date },
    bloodOrdered: { type: Boolean, default: false },
    bloodCrossmatched: { type: Boolean, default: false },
    anesthesiaAssessment: { type: String }
  },

  intraOp: {
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    findings: { type: String },
    complications: { type: String },
    implants: [OTImplantsSchema],
    sutures: [OTSuturesSchema],
    specimens: [OTSpecimenSchema],
    estimatedBloodLoss: { type: Number },
    fluidGiven: { type: Number },
    surgeonNotes: { type: String }
  },

  anesthesiaRecord: {
    induction: { type: String },
    maintenance: { type: String },
    reversal: { type: String },
    drugs: [OTDrugLogSchema],
    vitalsIntraOp: [OTVitalsSchema],
    complications: { type: String }
  },

  postOp: {
    recoveryStartTime: { type: Date },
    recoveryEndTime: { type: Date },
    aldreteScore: { type: Number },
    instructions: { type: String },
    complications: { type: String },
    transferTo: { type: String } // Ward or ICU name/ref
  },

  status: { type: String, enum: Object.values(OTCaseStatus), default: OTCaseStatus.SCHEDULED }
}, { timestamps: true });

// Auto-generate caseNumber before validation
OTCaseSchema.pre('validate', async function(next) {
  if (this.isNew && !this.caseNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.caseNumber = `OT-${dateStr}-${randomStr}`;
  }
  next();
});

export const getOperationTheaterModel = (connection: Connection): Model<IOperationTheater & Document> => {
  return connection.models.OperationTheater || connection.model<IOperationTheater & Document>('OperationTheater', OperationTheaterSchema);
};

export const getOTCaseModel = (connection: Connection): Model<IOTCase & Document> => {
  return connection.models.OTCase || connection.model<IOTCase & Document>('OTCase', OTCaseSchema);
};
