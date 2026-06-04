import mongoose, { Schema, Document, Model } from 'mongoose';
import { TenantPlan, TenantStatus } from '@medicalink/shared';

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  adminEmail: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  logo?: string;
  primaryColor: string;
  features: {
    pharmacy: boolean;
    lab: boolean;
    radiology: boolean;
    telemedicine: boolean;
    bloodBank: boolean;
    ai: boolean;
  };
  subscription: {
    planId?: string;
    startDate?: Date;
    endDate?: Date;
    status: string;
  };
  database: {
    name: string;
    connectionString?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantModel extends Model<TenantDocument> {
  findBySlug(slug: string): Promise<TenantDocument | null>;
}

const tenantSchema = new Schema<TenantDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan: { type: String, enum: Object.values(TenantPlan), required: true, default: TenantPlan.FREE },
    status: { type: String, enum: Object.values(TenantStatus), required: true, default: TenantStatus.ACTIVE },
    adminEmail: { type: String, required: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    logo: { type: String },
    primaryColor: { type: String, default: '#4F46E5' },
    features: {
      pharmacy: { type: Boolean, default: false },
      lab: { type: Boolean, default: false },
      radiology: { type: Boolean, default: false },
      telemedicine: { type: Boolean, default: false },
      bloodBank: { type: Boolean, default: false },
      ai: { type: Boolean, default: false },
    },
    subscription: {
      planId: String,
      startDate: Date,
      endDate: Date,
      status: { type: String, default: 'inactive' },
    },
    database: {
      name: { type: String, required: true },
      connectionString: String,
    },
    settings: {
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'YYYY-MM-DD' },
      language: { type: String, default: 'en' },
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 }, { unique: true });
tenantSchema.index({ status: 1 });

tenantSchema.statics.findBySlug = function (slug: string): Promise<TenantDocument | null> {
  return this.findOne({ slug, status: TenantStatus.ACTIVE }).exec();
};

export const Tenant = mongoose.model<TenantDocument, TenantModel>('Tenant', tenantSchema);
