import mongoose, { Schema, Document, Model } from 'mongoose';

export interface StockTransactionDocument extends Document {
  item: mongoose.Types.ObjectId | string;
  transactionType: 'RECEIPT' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGE';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  fromDepartment?: mongoose.Types.ObjectId | string;
  toDepartment?: mongoose.Types.ObjectId | string;
  reference?: string;
  performedBy: mongoose.Types.ObjectId | string;
  timestamp: Date;
  notes?: string;
  tenantId: string;
}

export type StockTransactionModel = Model<StockTransactionDocument>;

const stockTransactionSchema = new Schema<StockTransactionDocument>(
  {
    item: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
    transactionType: { 
      type: String, 
      enum: ['RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'DAMAGE'],
      required: true 
    },
    quantity: { type: Number, required: true }, // positive for receipt/return, negative for issue/damage? usually absolute + type determines direction
    unitCost: { type: Number, min: 0 },
    totalCost: { type: Number, min: 0 },
    fromDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
    toDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
    reference: { type: String }, // e.g. GRN number, PO number, Issue slip number
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    notes: { type: String },
    tenantId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

export const getStockTransactionModel = (connection: mongoose.Connection): StockTransactionModel => {
  return (connection.models.StockTransaction as StockTransactionModel) || connection.model<StockTransactionDocument, StockTransactionModel>('StockTransaction', stockTransactionSchema);
};
