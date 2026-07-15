import mongoose, { Schema, Document, Types } from 'mongoose';
import { SharedDocument } from '@medicalink/shared';

export interface IDocument extends Document, Omit<SharedDocument, '_id' | 'tenantId' | 'patientId' | 'staffId' | 'createdAt' | 'updatedAt'> {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  patientId?: Types.ObjectId;
  staffId?: Types.ObjectId;
}

const documentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', index: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedBy: { type: String, required: true }
}, {
  timestamps: true
});

export const getDocumentModel = (tenantDb: mongoose.Connection): mongoose.Model<IDocument> => {
  return tenantDb.model<IDocument>('Document', documentSchema);
};
