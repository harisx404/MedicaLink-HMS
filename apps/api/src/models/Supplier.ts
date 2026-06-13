import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISupplier } from '@medicalink/shared';

export interface SupplierDocument extends Omit<ISupplier, '_id' | 'id'>, Document {}

export interface SupplierModel extends Model<SupplierDocument> {
  // Add static methods if needed later
}

const supplierSchema = new Schema<SupplierDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    drugs: [{ type: Schema.Types.ObjectId, ref: 'Drug' }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const getSupplierModel = (connection: mongoose.Connection): SupplierModel => {
  return (connection.models.Supplier as SupplierModel) || connection.model<SupplierDocument, SupplierModel>('Supplier', supplierSchema);
};
