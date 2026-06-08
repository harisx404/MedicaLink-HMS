import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDepartment extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  headDoctor?: mongoose.Types.ObjectId; // Reference to User
  description?: string;
  floor?: string;
  extensionNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true,
    },
    headDoctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    extensionNumber: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness of department code per tenant
departmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });

const Department: Model<IDepartment> = mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;
