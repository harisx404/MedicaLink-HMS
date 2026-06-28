import mongoose, { Schema, Document, Model, Connection } from 'mongoose';
import { getCounterModel } from './Counter';

export interface Allergy {
  allergen: string;
  type: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
  addedBy: mongoose.Types.ObjectId;
}

export interface ChronicCondition {
  condition: string;
  icdCode?: string;
  diagnosedDate?: Date;
  status: 'ACTIVE' | 'RESOLVED' | 'MANAGED';
}

export interface CurrentMedication {
  drug: string;
  dose: string;
  frequency: string;
  prescribedBy: mongoose.Types.ObjectId;
}

export interface Immunization {
  vaccine: string;
  date: Date;
  nextDue?: Date;
  batchNumber?: string;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  memberName: string;
  validFrom: Date;
  validTo: Date;
  cardImage?: string;
  preauthRequired: boolean;
  tpaName?: string;
}

export interface PatientDocument extends Document {
  uhid: string; // Auto-generated HMS-YYYY-NNNNNN
  tenantId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';
  religion?: string;
  nationality: string;
  photo?: string;
  
  // Contact
  phone: string;
  altPhone?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
  };
  
  // Medical Info
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  currentMedications: CurrentMedication[];
  immunizations: Immunization[];
  
  // Insurance
  insurances: Insurance[];
  
  // Registration
  registrationType: 'OPD' | 'IPD' | 'EMERGENCY';
  referredBy?: {
    type: 'DOCTOR' | 'HOSPITAL' | 'SELF';
    name?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  registrationDate: Date;
  isActive: boolean;
  
  // Patient Portal
  portalUserId?: string;
  isPortalEnabled: boolean;
  
  // Analytics
  totalVisits: number;
  lastVisitDate?: Date;
  totalBilled: number;
  outstandingBalance: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<PatientDocument>(
  {
    uhid: { type: String, unique: true }, // Not required initially, will be generated
    tenantId: { type: String, required: true, index: true },
    
    // Personal Info
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    bloodGroup: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
      default: 'UNKNOWN'
    },
    maritalStatus: { 
      type: String, 
      enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'],
      default: 'SINGLE'
    },
    religion: { type: String, trim: true },
    nationality: { type: String, required: true, trim: true },
    photo: { type: String },
    
    // Contact
    phone: { type: String, required: true, trim: true, index: true },
    altPhone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    
    // Emergency Contact
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String },
    },
    
    // Medical Info
    allergies: [
      {
        allergen: { type: String, required: true },
        type: { type: String, required: true },
        severity: { type: String, enum: ['MILD', 'MODERATE', 'SEVERE'], required: true },
        reaction: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      }
    ],
    chronicConditions: [
      {
        condition: { type: String, required: true },
        icdCode: { type: String },
        diagnosedDate: { type: Date },
        status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'MANAGED'], required: true },
      }
    ],
    currentMedications: [
      {
        drug: { type: String, required: true },
        dose: { type: String, required: true },
        frequency: { type: String, required: true },
        prescribedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      }
    ],
    immunizations: [
      {
        vaccine: { type: String, required: true },
        date: { type: Date, required: true },
        nextDue: { type: Date },
        batchNumber: { type: String },
      }
    ],
    
    // Insurance
    insurances: [
      {
        provider: { type: String, required: true },
        policyNumber: { type: String, required: true },
        memberName: { type: String, required: true },
        validFrom: { type: Date, required: true },
        validTo: { type: Date, required: true },
        cardImage: { type: String },
        preauthRequired: { type: Boolean, default: false },
        tpaName: { type: String },
      }
    ],
    
    // Registration
    registrationType: { type: String, enum: ['OPD', 'IPD', 'EMERGENCY'], required: true },
    referredBy: {
      type: { type: String, enum: ['DOCTOR', 'HOSPITAL', 'SELF'] },
      name: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    
    // Patient Portal
    portalUserId: { type: String },
    isPortalEnabled: { type: Boolean, default: false },
    
    // Analytics
    totalVisits: { type: Number, default: 0 },
    lastVisitDate: { type: Date },
    totalBilled: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for searching (Phase 19 Performance Optimization)
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ uhid: 1 }, { unique: true });

// UHID Generation Pre-Save Hook
patientSchema.pre('save', async function (next) {
  if (this.isNew && !this.uhid) {
    try {
      // The current connection is the tenant DB
      const db = this.db;
      const Counter = getCounterModel(db);
      
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'patient_uhid' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      const year = new Date().getFullYear();
      const sequence = counter.seq.toString().padStart(6, '0');
      this.uhid = `HMS-${year}-${sequence}`;
      
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const getPatientModel = (tenantDb: Connection): Model<PatientDocument> => {
  return tenantDb.models.Patient || tenantDb.model<PatientDocument>('Patient', patientSchema);
};
