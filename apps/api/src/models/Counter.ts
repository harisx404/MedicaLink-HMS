import { Schema, Model, Connection } from 'mongoose';

export interface CounterDocument {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const getCounterModel = (tenantDb: Connection): Model<CounterDocument> => {
  return tenantDb.models.Counter || tenantDb.model<CounterDocument>('Counter', counterSchema);
};
