import mongoose, { Schema, Document, Model } from 'mongoose';
import { InventoryCategory } from '@medicalink/shared';

export interface InventoryItemDocument extends Document {
  code: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  specifications?: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  unitCost: number;
  location: {
    building?: string;
    floor?: string;
    storeroom?: string;
  };
  isAsset: boolean;
  supplier?: mongoose.Types.ObjectId | string;
  isActive: boolean;
  tenantId: string;
}

export type InventoryItemModel = Model<InventoryItemDocument>;

const inventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: Object.values(InventoryCategory), required: true },
    unit: { type: String, required: true },
    specifications: { type: String },
    currentStock: { type: Number, required: true, default: 0 },
    minimumStock: { type: Number, required: true, default: 0 },
    maximumStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 0 },
    unitCost: { type: Number, required: true, default: 0 },
    location: {
      building: { type: String },
      floor: { type: String },
      storeroom: { type: String }
    },
    isAsset: { type: Boolean, required: true, default: false },
    supplier: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    isActive: { type: Boolean, required: true, default: true },
    tenantId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

export const getInventoryItemModel = (connection: mongoose.Connection): InventoryItemModel => {
  return (connection.models.InventoryItem as InventoryItemModel) || connection.model<InventoryItemDocument, InventoryItemModel>('InventoryItem', inventoryItemSchema);
};
