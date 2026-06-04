import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AuditLogDocument extends Document {
  action: string;
  actor: string;
  actorEmail?: string;
  actorRole?: string;
  tenantId?: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    action: { type: String, required: true },
    actor: { type: String, required: true },
    actorEmail: { type: String },
    actorRole: { type: String },
    tenantId: { type: String },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  // No timestamps because timestamp is explicitly set above, and audit logs are append-only.
  { timestamps: false }
);

auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ actor: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1 });

export const AuditLog: Model<AuditLogDocument> = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);
