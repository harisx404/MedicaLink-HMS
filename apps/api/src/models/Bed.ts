import mongoose, { Document, Schema, Model } from 'mongoose';

export type BedType = 'STANDARD' | 'ICU' | 'HDU' | 'ISOLATION';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface IBed extends Document {
  tenantId: mongoose.Types.ObjectId;
  wardId: mongoose.Types.ObjectId;
  bedNumber: string;
  type: BedType;
  status: BedStatus;
  currentPatientId?: mongoose.Types.ObjectId; // Reference to Patient when OCCUPIED
  features: string[]; // e.g., ["Oxygen", "Ventilator"]
  createdAt: Date;
  updatedAt: Date;
}

const bedSchema = new Schema<IBed>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
      required: [true, 'Ward ID is required'],
      index: true,
    },
    bedNumber: {
      type: String,
      required: [true, 'Bed number is required'],
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['STANDARD', 'ICU', 'HDU', 'ISOLATION'],
      default: 'STANDARD',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'],
      default: 'AVAILABLE',
      index: true,
    },
    currentPatientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient', // Assuming Patient model will be created in Phase 4
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness of bed number within a ward
bedSchema.index({ wardId: 1, bedNumber: 1 }, { unique: true });

const Bed: Model<IBed> = mongoose.model<IBed>('Bed', bedSchema);

export default Bed;
