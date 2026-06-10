import mongoose, { Schema, Document } from 'mongoose';
import { ICD10Code, DrugFormulary } from '@medicalink/shared';

export interface ICD10Document extends Omit<ICD10Code, 'id' | '_id'>, Document {}

const icd10Schema = new Schema<ICD10Document>({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  isBillable: { type: Boolean, default: true }
}, {
  timestamps: true
});

icd10Schema.index({ code: 'text', description: 'text' });

export interface DrugFormularyDocument extends Omit<DrugFormulary, 'id' | '_id'>, Document {
  tenantId: string;
}

const drugFormularySchema = new Schema<DrugFormularyDocument>({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  therapeuticClass: String,
  form: { type: String, required: true },
  strength: { type: String, required: true },
  unit: String,
  isActive: { type: Boolean, default: true },
  isFormulary: { type: Boolean, default: true }
}, {
  timestamps: true
});

drugFormularySchema.index({ tenantId: 1, name: 'text', genericName: 'text' });

export const getICD10Model = (connection: mongoose.Connection) => {
  // ICD10 is usually cross-tenant, but we can store it in tenant db or global db
  return connection.models.ICD10 || connection.model<ICD10Document>('ICD10', icd10Schema);
};

export const getDrugFormularyModel = (connection: mongoose.Connection) => {
  return connection.models.DrugFormulary || connection.model<DrugFormularyDocument>('DrugFormulary', drugFormularySchema);
};
