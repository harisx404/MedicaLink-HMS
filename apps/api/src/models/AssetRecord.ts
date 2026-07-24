import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AssetRecordDocument extends Document {
  assetNumber: string;
  item: mongoose.Types.ObjectId | string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiry?: Date;
  location: {
    building?: string;
    floor?: string;
    room?: string;
  };
  assignedTo?: mongoose.Types.ObjectId | string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'OUT_OF_SERVICE';
  maintenanceSchedule?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  depreciationRate?: number;
  currentValue?: number;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'CONDEMNED' | 'DISPOSED';
  tenantId: string;
}

export type AssetRecordModel = Model<AssetRecordDocument>;

const assetRecordSchema = new Schema<AssetRecordDocument>(
  {
    assetNumber: { type: String, required: true, unique: true },
    item: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
    serialNumber: { type: String },
    purchaseDate: { type: Date },
    purchaseCost: { type: Number, min: 0 },
    warrantyExpiry: { type: Date },
    location: {
      building: { type: String },
      floor: { type: String },
      room: { type: String }
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Department' },
    condition: { 
      type: String, 
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'OUT_OF_SERVICE'], 
      required: true,
      default: 'GOOD'
    },
    maintenanceSchedule: { type: String },
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    depreciationRate: { type: Number, min: 0, max: 100 },
    currentValue: { type: Number, min: 0 },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'IN_MAINTENANCE', 'CONDEMNED', 'DISPOSED'], 
      required: true,
      default: 'ACTIVE'
    },
    tenantId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

export const getAssetRecordModel = (connection: mongoose.Connection): AssetRecordModel => {
  return (connection.models.AssetRecord as AssetRecordModel) || connection.model<AssetRecordDocument, AssetRecordModel>('AssetRecord', assetRecordSchema);
};
