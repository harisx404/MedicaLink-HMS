import mongoose, { Document, Schema, Connection } from 'mongoose';

export interface IDicomStudy extends Document {
  tenantId: string;
  orderId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  studyInstanceUID: string;
  seriesCount: number;
  imageCount: number;
  modality: string;
  studyDate: Date;
  pacsUrl?: string;
  storedIn: 'CLOUDINARY' | 'S3' | 'LOCAL_PACS';
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dicomStudySchema = new Schema<IDicomStudy>(
  {
    tenantId: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'RadiologyOrder', required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    studyInstanceUID: { type: String, required: true, unique: true },
    seriesCount: { type: Number, default: 0 },
    imageCount: { type: Number, default: 0 },
    modality: { type: String, required: true },
    studyDate: { type: Date, required: true },
    pacsUrl: { type: String },
    storedIn: { 
      type: String, 
      enum: ['CLOUDINARY', 'S3', 'LOCAL_PACS'], 
      default: 'LOCAL_PACS' 
    },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dicomStudySchema.index({ tenantId: 1, patientId: 1 });

export const getDicomStudyModel = (connection: Connection) => {
  return connection.model<IDicomStudy>('DicomStudy', dicomStudySchema);
};
