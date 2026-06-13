import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITestCatalogDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  shortName?: string;
  category: string;
  sampleType: string;
  container?: string;
  volume?: string;
  instructions?: string;
  turnaroundTime: number; // in hours
  parameters: Array<{
    name: string;
    unit?: string;
    referenceRanges: Array<{
      ageMin?: number;
      ageMax?: number;
      gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'ALL';
      minValue?: number;
      maxValue?: number;
      normalText?: string;
    }>;
    criticalLow?: number;
    criticalHigh?: number;
    dataType: 'NUMERIC' | 'TEXT' | 'OPTION';
  }>;
  preparation: 'FASTING' | 'RANDOM' | '2HR_POSTPRANDIAL' | 'NONE';
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testCatalogSchema = new Schema<ITestCatalogDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['HEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY', 'SEROLOGY', 'IMMUNOLOGY', 'COAGULATION', 'URINALYSIS', 'OTHER'],
    required: true
  },
  sampleType: {
    type: String,
    enum: ['BLOOD', 'URINE', 'STOOL', 'SPUTUM', 'FLUID', 'SWAB', 'OTHER'],
    required: true
  },
  container: String,
  volume: String,
  instructions: String,
  turnaroundTime: {
    type: Number,
    required: true,
    default: 24
  },
  parameters: [{
    name: { type: String, required: true },
    unit: String,
    referenceRanges: [{
      ageMin: Number,
      ageMax: Number,
      gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'ALL'], default: 'ALL' },
      minValue: Number,
      maxValue: Number,
      normalText: String
    }],
    criticalLow: Number,
    criticalHigh: Number,
    dataType: { type: String, enum: ['NUMERIC', 'TEXT', 'OPTION'], required: true, default: 'NUMERIC' }
  }],
  preparation: {
    type: String,
    enum: ['FASTING', 'RANDOM', '2HR_POSTPRANDIAL', 'NONE'],
    default: 'NONE'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure test codes are unique per tenant
testCatalogSchema.index({ tenantId: 1, code: 1 }, { unique: true });
testCatalogSchema.index({ tenantId: 1, name: 1 });

export const getTestCatalogModel = (connection: mongoose.Connection): Model<ITestCatalogDocument> => {
  return connection.models.TestCatalog || connection.model<ITestCatalogDocument>('TestCatalog', testCatalogSchema);
};
