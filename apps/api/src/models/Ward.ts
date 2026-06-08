import mongoose, { Document, Schema, Model } from 'mongoose';

export type WardType = 'GENERAL' | 'ICU' | 'HDU' | 'MATERNITY' | 'PEDIATRIC';

export interface IWard extends Document {
  tenantId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  type: WardType;
  floor: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wardSchema = new Schema<IWard>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Ward name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Ward code is required'],
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['GENERAL', 'ICU', 'HDU', 'MATERNITY', 'PEDIATRIC'],
      required: [true, 'Ward type is required'],
    },
    floor: {
      type: String,
      required: [true, 'Floor location is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Ward capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness of ward code per tenant
wardSchema.index({ tenantId: 1, code: 1 }, { unique: true });

const Ward: Model<IWard> = mongoose.model<IWard>('Ward', wardSchema);

export default Ward;
