import mongoose, { Schema, Document } from 'mongoose';

export interface MARDocument extends Document {
  tenantId: string;
  patient: mongoose.Types.ObjectId;
  prescription: mongoose.Types.ObjectId;
  medicationId: mongoose.Types.ObjectId;
  drugName: string;
  dose: string;
  route: string;
  administeredBy: mongoose.Types.ObjectId;
  administeredAt: Date;
  status: 'GIVEN' | 'HELD' | 'REFUSED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const marSchema = new Schema<MARDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription', required: true },
    medicationId: { type: Schema.Types.ObjectId, required: true }, // The ID of the specific medication inside the prescription array
    drugName: { type: String, required: true },
    dose: { type: String, required: true },
    route: { type: String },
    administeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    administeredAt: { type: Date, required: true },
    status: { type: String, enum: ['GIVEN', 'HELD', 'REFUSED'], required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

marSchema.index({ tenantId: 1, patient: 1, administeredAt: -1 });

export const getMARModel = (connection: mongoose.Connection) => {
  return connection.models.MAR || connection.model<MARDocument>('MAR', marSchema);
};
