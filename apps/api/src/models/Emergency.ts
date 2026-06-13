import mongoose, { Schema, Document, Connection, Model } from 'mongoose';
import { IEmergencyPatient, IAmbulance } from '@medicalink/shared';

const EmergencyInterventionSchema = new Schema({
  intervention: { type: String, required: true },
  time: { type: Date, required: true },
  by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String }
}, { _id: false });

const EmergencyPatientSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient' }, // Optional if unknown
  unknownIdentity: {
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    approximateAge: { type: Number },
    description: { type: String }
  },
  triageLevel: { 
    type: String, 
    enum: ['RESUSCITATION', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT'],
    required: true
  },
  triageColor: {
    type: String,
    enum: ['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE'],
    required: true
  },
  triageTime: { type: Date },
  triageBy: { type: Schema.Types.ObjectId, ref: 'User' },
  chiefComplaint: { type: String, required: true },
  arrivalMode: {
    type: String,
    enum: ['AMBULANCE', 'WALK_IN', 'REFERRED', 'POLICE'],
    required: true
  },
  arrivalTime: { type: Date, required: true, default: Date.now },
  mlasScore: { type: Number },
  gcsScore: { type: Number },
  primarySurvey: {
    airway: { type: String },
    breathing: { type: String },
    circulation: { type: String },
    disability: { type: String }
  },
  vitals: {
    hr: { type: Number },
    bp: { type: String },
    rr: { type: Number },
    temp: { type: Number },
    spO2: { type: Number }
  },
  interventions: [EmergencyInterventionSchema],
  disposition: {
    type: String,
    enum: ['ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'DECEASED', 'LEFT_WITHOUT_TREATMENT']
  },
  dispositionTime: { type: Date },
  dispositionDoctor: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const AmbulanceSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  paramedic: { type: Schema.Types.ObjectId, ref: 'User' },
  currentStatus: {
    type: String,
    enum: ['AVAILABLE', 'DISPATCHED', 'ON_SCENE', 'TRANSPORTING', 'RETURNING'],
    default: 'AVAILABLE'
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  currentCallId: { type: Schema.Types.ObjectId, ref: 'EmergencyPatient' }
}, { timestamps: true });

export const getEmergencyPatientModel = (tenantDb: Connection): Model<IEmergencyPatient & Document> => {
  return tenantDb.models.EmergencyPatient || tenantDb.model<IEmergencyPatient & Document>('EmergencyPatient', EmergencyPatientSchema);
};

export const getAmbulanceModel = (tenantDb: Connection): Model<IAmbulance & Document> => {
  return tenantDb.models.Ambulance || tenantDb.model<IAmbulance & Document>('Ambulance', AmbulanceSchema);
};
