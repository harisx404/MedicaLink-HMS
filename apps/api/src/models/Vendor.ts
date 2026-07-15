import mongoose, { Schema, Document, Model } from 'mongoose';

export interface VendorDocument extends Document {
  name: string;
  category?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifsc?: string;
  };
  rating?: number;
  paymentTerms?: string;
  items: mongoose.Types.ObjectId[] | string[];
  isActive: boolean;
  tenantId: string;
}

export interface VendorModel extends Model<VendorDocument> {}

const vendorSchema = new Schema<VendorDocument>(
  {
    name: { type: String, required: true },
    category: { type: String },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String }
    },
    gstNumber: { type: String },
    panNumber: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      bankName: { type: String },
      ifsc: { type: String }
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    paymentTerms: { type: String },
    items: [{ type: Schema.Types.ObjectId, ref: 'InventoryItem' }],
    isActive: { type: Boolean, required: true, default: true },
    tenantId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

export const getVendorModel = (connection: mongoose.Connection): VendorModel => {
  return (connection.models.Vendor as VendorModel) || connection.model<VendorDocument, VendorModel>('Vendor', vendorSchema);
};
