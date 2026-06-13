import mongoose, { Schema, Document, Connection, Model } from 'mongoose';
import { 
  IDonor, IBloodUnit, IBloodRequest,
  BloodGroup, BloodComponentType, BloodUnitStatus, BloodRequestStatus, RequestUrgency 
} from '@medicalink/shared';

const DonorSchema = new Schema({
  tenantId: { type: String, required: true },
  donorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true },
  rhFactor: { type: String, enum: ['POSITIVE', 'NEGATIVE'], required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  weight: { type: Number, required: true },
  lastDonationDate: { type: Date },
  healthHistory: { type: String },
  eligibilityStatus: { type: String, enum: ['ELIGIBLE', 'DEFERRED', 'INELIGIBLE'], default: 'ELIGIBLE' },
  donations: [{ type: Schema.Types.ObjectId, ref: 'BloodUnit' }]
}, { timestamps: true });

// Auto-generate donorId
DonorSchema.pre('validate', async function(next) {
  if (this.isNew && !this.donorId) {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.donorId = `DNR-${randomStr}`;
  }
  next();
});

const BloodTestResultsSchema = new Schema({
  hiv: { type: String, enum: ['NEGATIVE', 'POSITIVE', 'PENDING'], default: 'PENDING' },
  hbsag: { type: String, enum: ['NEGATIVE', 'POSITIVE', 'PENDING'], default: 'PENDING' },
  hcv: { type: String, enum: ['NEGATIVE', 'POSITIVE', 'PENDING'], default: 'PENDING' },
  vdrl: { type: String, enum: ['NEGATIVE', 'POSITIVE', 'PENDING'], default: 'PENDING' },
  malaria: { type: String, enum: ['NEGATIVE', 'POSITIVE', 'PENDING'], default: 'PENDING' },
  testedAt: { type: Date },
  testedBy: { type: String }
}, { _id: false });

const BloodUnitSchema = new Schema({
  tenantId: { type: String, required: true },
  unitNumber: { type: String, required: true, unique: true },
  bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true },
  rhFactor: { type: String, enum: ['POSITIVE', 'NEGATIVE'], required: true },
  componentType: { type: String, enum: Object.values(BloodComponentType), required: true },
  collectedFrom: { type: Schema.Types.ObjectId, ref: 'Donor' },
  externalSource: { type: String },
  collectedDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  volume: { type: Number, required: true }, // in ml
  bagType: { type: String },
  tests: { type: BloodTestResultsSchema, default: () => ({}) },
  status: { type: String, enum: Object.values(BloodUnitStatus), default: BloodUnitStatus.AVAILABLE },
  issuedTo: { type: Schema.Types.ObjectId, ref: 'Patient' },
  issuedFor: { type: Schema.Types.ObjectId, ref: 'OTCase' }, // or procedure
  crossmatchDone: { type: Boolean, default: false },
  crossmatchBy: { type: String },
  issuedAt: { type: Date },
  returnedAt: { type: Date }
}, { timestamps: true });

const BloodRequestSchema = new Schema({
  tenantId: { type: String, required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  procedure: { type: Schema.Types.ObjectId, ref: 'OTCase' },
  bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true },
  component: { type: String, enum: Object.values(BloodComponentType), required: true },
  quantityRequested: { type: Number, required: true },
  urgency: { type: String, enum: Object.values(RequestUrgency), required: true },
  clinicalHistory: { type: String },
  status: { type: String, enum: Object.values(BloodRequestStatus), default: BloodRequestStatus.PENDING }
}, { timestamps: true });

export const getDonorModel = (connection: Connection): Model<IDonor & Document> => {
  return connection.models.Donor || connection.model<IDonor & Document>('Donor', DonorSchema);
};

export const getBloodUnitModel = (connection: Connection): Model<IBloodUnit & Document> => {
  return connection.models.BloodUnit || connection.model<IBloodUnit & Document>('BloodUnit', BloodUnitSchema);
};

export const getBloodRequestModel = (connection: Connection): Model<IBloodRequest & Document> => {
  return connection.models.BloodRequest || connection.model<IBloodRequest & Document>('BloodRequest', BloodRequestSchema);
};
