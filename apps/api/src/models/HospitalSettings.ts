import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IHospitalSettings extends Document {
  tenantId: mongoose.Types.ObjectId;
  general: {
    hospitalName: string;
    tagline?: string;
    logoUrl?: string;
    address?: string;
    contactNumbers?: string[];
    email?: string;
    taxNumber?: string;
    licenseNumber?: string;
    workingHours?: {
      day: string;
      open: string;
      close: string;
      isClosed: boolean;
    }[];
  };
  appearance: {
    primaryColor: string;
    faviconUrl?: string;
    footerText?: string;
  };
  financial: {
    defaultCurrency: string;
    taxRates: { name: string; percentage: number }[];
    acceptedPaymentModes: string[];
    insurancePanels: string[];
  };
  notifications: {
    smsProvider?: 'twilio' | 'aws-sns' | 'custom';
    smsConfig?: Record<string, string>;
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      fromAddress: string;
    };
  };
  integrations: {
    hl7Config?: {
      serverIp: string;
      port: number;
      isActive: boolean;
    };
    dicomConfig?: {
      aeTitle: string;
      serverIp: string;
      port: number;
      isActive: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSettingsSchema = new Schema<IHospitalSettings>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      unique: true, // One settings document per tenant
    },
    general: {
      hospitalName: { type: String, required: true },
      tagline: { type: String },
      logoUrl: { type: String },
      address: { type: String },
      contactNumbers: [{ type: String }],
      email: { type: String, lowercase: true, trim: true },
      taxNumber: { type: String },
      licenseNumber: { type: String },
      workingHours: [
        {
          day: { type: String },
          open: { type: String },
          close: { type: String },
          isClosed: { type: Boolean, default: false },
        },
      ],
    },
    appearance: {
      primaryColor: { type: String, default: '#0F172A' },
      faviconUrl: { type: String },
      footerText: { type: String },
    },
    financial: {
      defaultCurrency: { type: String, default: 'USD' },
      taxRates: [
        {
          name: { type: String },
          percentage: { type: Number },
        },
      ],
      acceptedPaymentModes: [{ type: String }],
      insurancePanels: [{ type: String }],
    },
    notifications: {
      smsProvider: { type: String, enum: ['twilio', 'aws-sns', 'custom'] },
      smsConfig: { type: Schema.Types.Mixed },
      smtpConfig: {
        host: { type: String },
        port: { type: Number },
        secure: { type: Boolean },
        user: { type: String },
        pass: { type: String },
        fromAddress: { type: String },
      },
    },
    integrations: {
      hl7Config: {
        serverIp: { type: String },
        port: { type: Number },
        isActive: { type: Boolean, default: false },
      },
      dicomConfig: {
        aeTitle: { type: String },
        serverIp: { type: String },
        port: { type: Number },
        isActive: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

const HospitalSettings: Model<IHospitalSettings> = mongoose.model<IHospitalSettings>(
  'HospitalSettings',
  hospitalSettingsSchema
);

export default HospitalSettings;
