import mongoose, { Schema, Document, Model, Connection } from 'mongoose';

export interface DoctorDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: string;
  
  registrationNumber: string;
  specializations: Array<{
    specialty: string;
    subSpecialty?: string;
    isPrimary: boolean;
  }>;
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
    certificate?: string;
  }>;
  experience: number; // in years
  
  weeklySchedule: Array<{
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    isWorking: boolean;
    shifts: Array<{
      startTime: string; // HH:mm
      endTime: string;   // HH:mm
      appointmentDuration: number;
      maxPatients: number;
      type: 'OPD' | 'IPD' | 'EMERGENCY';
    }>;
  }>;
  
  consultationFee: {
    opd: number;
    ipd: number;
    emergency: number;
    followUp: number;
    telemedicine: number;
  };
  
  biography?: string;
  languages: string[];
  awards: string[];
  publications: string[];
  photo?: string;
  
  avgRating: number;
  totalRatings: number;
  totalConsultations: number;
  
  isAvailableToday: boolean;
  currentStatus: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE' | 'OFFLINE';
  
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<DoctorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tenantId: { type: String, required: true, index: true },
    
    registrationNumber: { type: String, required: true, unique: true },
    specializations: [
      {
        specialty: { type: String, required: true },
        subSpecialty: { type: String },
        isPrimary: { type: Boolean, default: false },
      }
    ],
    qualifications: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        certificate: { type: String },
      }
    ],
    experience: { type: Number, default: 0 },
    
    weeklySchedule: [
      {
        day: { type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], required: true },
        isWorking: { type: Boolean, default: true },
        shifts: [
          {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            appointmentDuration: { type: Number, required: true },
            maxPatients: { type: Number, required: true },
            type: { type: String, enum: ['OPD', 'IPD', 'EMERGENCY'], default: 'OPD' },
          }
        ]
      }
    ],
    
    consultationFee: {
      opd: { type: Number, default: 0 },
      ipd: { type: Number, default: 0 },
      emergency: { type: Number, default: 0 },
      followUp: { type: Number, default: 0 },
      telemedicine: { type: Number, default: 0 },
    },
    
    biography: { type: String },
    languages: [{ type: String }],
    awards: [{ type: String }],
    publications: [{ type: String }],
    photo: { type: String },
    
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 },
    
    isAvailableToday: { type: Boolean, default: true },
    currentStatus: { 
      type: String, 
      enum: ['AVAILABLE', 'IN_CONSULTATION', 'ON_LEAVE', 'OFFLINE'],
      default: 'AVAILABLE' 
    },
  },
  { timestamps: true }
);

// Indexes
doctorSchema.index({ 'specializations.specialty': 1 });
doctorSchema.index({ currentStatus: 1 });
doctorSchema.index({ avgRating: -1 });

export const getDoctorModel = (tenantDb: Connection): Model<DoctorDocument> => {
  return tenantDb.models.Doctor || tenantDb.model<DoctorDocument>('Doctor', doctorSchema);
};
