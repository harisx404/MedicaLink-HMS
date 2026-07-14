import mongoose, { Schema, Document } from 'mongoose';

export interface HandoverDocument extends Document {
  tenantId: string;
  ward: mongoose.Types.ObjectId;
  shiftFrom: mongoose.Types.ObjectId;
  shiftTo: mongoose.Types.ObjectId;
  report: string;
  criticalPatients: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const handoverSchema = new Schema<HandoverDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    ward: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    shiftFrom: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shiftTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    report: { type: String, required: true },
    criticalPatients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
  },
  {
    timestamps: true,
  }
);

handoverSchema.index({ tenantId: 1, ward: 1, createdAt: -1 });

export const getHandoverModel = (connection: mongoose.Connection) => {
  return connection.models.Handover || connection.model<HandoverDocument>('Handover', handoverSchema);
};
