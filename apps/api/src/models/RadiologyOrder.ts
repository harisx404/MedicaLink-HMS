import mongoose, { Document, Schema, Connection } from 'mongoose';

export interface IRadiologyOrder extends Document {
  tenantId: string;
  orderNumber: string;
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  consultation?: mongoose.Types.ObjectId;
  modality: 'XRAY' | 'CT' | 'MRI' | 'USG' | 'ECHO' | 'MAMMOGRAPHY' | 'PET' | 'NUCLEAR';
  bodyPart: string;
  laterality?: 'LEFT' | 'RIGHT' | 'BILATERAL' | 'N/A';
  clinicalHistory?: string;
  urgency: 'ROUTINE' | 'URGENT' | 'STAT';
  contrastRequired: boolean;
  patientPreparation?: string;
  scheduledDate?: Date;
  completedAt?: Date;
  technician?: mongoose.Types.ObjectId;
  radiologist?: mongoose.Types.ObjectId;
  status: 'ORDERED' | 'SCHEDULED' | 'IN_PROGRESS' | 'IMAGES_UPLOADED' | 'REPORTED' | 'VERIFIED';
  createdAt: Date;
  updatedAt: Date;
}

const radiologyOrderSchema = new Schema<IRadiologyOrder>(
  {
    tenantId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User' },
    consultation: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    modality: { 
      type: String, 
      enum: ['XRAY', 'CT', 'MRI', 'USG', 'ECHO', 'MAMMOGRAPHY', 'PET', 'NUCLEAR'], 
      required: true 
    },
    bodyPart: { type: String, required: true },
    laterality: { 
      type: String, 
      enum: ['LEFT', 'RIGHT', 'BILATERAL', 'N/A'], 
      default: 'N/A' 
    },
    clinicalHistory: { type: String },
    urgency: { 
      type: String, 
      enum: ['ROUTINE', 'URGENT', 'STAT'], 
      default: 'ROUTINE' 
    },
    contrastRequired: { type: Boolean, default: false },
    patientPreparation: { type: String },
    scheduledDate: { type: Date },
    completedAt: { type: Date },
    technician: { type: Schema.Types.ObjectId, ref: 'User' },
    radiologist: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['ORDERED', 'SCHEDULED', 'IN_PROGRESS', 'IMAGES_UPLOADED', 'REPORTED', 'VERIFIED'], 
      default: 'ORDERED' 
    }
  },
  { timestamps: true }
);

radiologyOrderSchema.index({ tenantId: 1, status: 1 });
radiologyOrderSchema.index({ tenantId: 1, patient: 1 });

export const getRadiologyOrderModel = (connection: Connection) => {
  return connection.model<IRadiologyOrder>('RadiologyOrder', radiologyOrderSchema);
};
