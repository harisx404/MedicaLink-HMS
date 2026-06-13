import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDrug, DrugCategory, DrugSchedule } from '@medicalink/shared';

export interface DrugDocument extends Omit<IDrug, '_id' | 'id'>, Document {}

export interface DrugModel extends Model<DrugDocument> {
  findByTenant(tenantId: string): Promise<DrugDocument[]>;
}

const drugSchema = new Schema<DrugDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, enum: Object.values(DrugCategory), required: true },
    therapeuticClass: { type: String, trim: true },
    form: { type: String, required: true, trim: true },
    strength: { type: String, required: true, trim: true },
    unit: { type: String, trim: true },
    hsnCode: { type: String, trim: true },
    barcode: { type: String, trim: true, index: true },
    drugSchedule: { type: String, enum: Object.values(DrugSchedule) },
    
    // Pricing
    purchaseRate: { type: Number, required: true, min: 0 },
    sellingRate: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    taxCategory: { type: Number, default: 0 },
    
    // Inventory
    currentStock: { type: Number, default: 0, min: 0 },
    minimumStock: { type: Number, default: 0, min: 0 },
    maximumStock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    
    // Status
    isFormulary: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    
    // Manufacturer
    manufacturer: { type: String, trim: true },
    importerName: { type: String, trim: true }
  },
  { timestamps: true }
);

// Indexes
drugSchema.index({ tenantId: 1, name: 1 });
drugSchema.index({ tenantId: 1, genericName: 1 });
drugSchema.index({ tenantId: 1, category: 1 });

drugSchema.statics.findByTenant = function (tenantId: string): Promise<DrugDocument[]> {
  return this.find({ tenantId });
};

// Return the model if it exists, otherwise create it
export const getDrugModel = (connection: mongoose.Connection): DrugModel => {
  return (connection.models.Drug as DrugModel) || connection.model<DrugDocument, DrugModel>('Drug', drugSchema);
};
