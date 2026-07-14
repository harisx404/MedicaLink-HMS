import mongoose, { Schema, Document } from 'mongoose';

export interface NursingNoteDocument extends Document {
  tenantId: string;
  patient: mongoose.Types.ObjectId;
  nurse: mongoose.Types.ObjectId;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const nursingNoteSchema = new Schema<NursingNoteDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    nurse: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shift: { type: String, enum: ['MORNING', 'EVENING', 'NIGHT'], required: true },
    note: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

nursingNoteSchema.index({ tenantId: 1, patient: 1, createdAt: -1 });

export const getNursingNoteModel = (connection: mongoose.Connection) => {
  return connection.models.NursingNote || connection.model<NursingNoteDocument>('NursingNote', nursingNoteSchema);
};
