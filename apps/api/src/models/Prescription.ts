import mongoose, { Schema, Document } from 'mongoose';
import { SharedPrescription } from '@medicalink/shared';

export interface PrescriptionDocument extends Omit<SharedPrescription, 'id' | '_id'>, Document {
  tenantId: string;
}

const prescriptionSchema = new Schema<PrescriptionDocument>({
  tenantId: { type: String, required: true, index: true },
  prescriptionNumber: { type: String, required: true },
  consultation: { type: Schema.Types.ObjectId, ref: 'Consultation', required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  
  medications: [{
    drugId: { type: Schema.Types.ObjectId, ref: 'DrugFormulary' },
    drugName: { type: String, required: true },
    genericName: String,
    strength: String,
    form: String,
    dose: { type: String, required: true },
    doseUnit: String,
    frequency: {
      times: Number,
      period: String,
      instructions: String
    },
    route: String,
    duration: { type: String, required: true },
    quantity: { type: Number, required: true },
    whenToTake: String,
    instructions: String,
    isSubstitutable: { type: Boolean, default: true }
  }],
  
  generalInstructions: String,
  followUpDate: String,
  digitalSignature: String,
  qrCode: String,
  
  pharmacyStatus: { type: String, enum: ['PENDING', 'DISPENSED', 'PARTIAL'], default: 'PENDING' }
}, {
  timestamps: true
});

prescriptionSchema.index({ tenantId: 1, prescriptionNumber: 1 }, { unique: true });
prescriptionSchema.index({ tenantId: 1, patient: 1 });
prescriptionSchema.index({ tenantId: 1, consultation: 1 });

export const getPrescriptionModel = (connection: mongoose.Connection) => {
  return connection.models.Prescription || connection.model<PrescriptionDocument>('Prescription', prescriptionSchema);
};
