import mongoose, { Schema, Document } from 'mongoose';
import { SharedAuditLog, AuditAction, AuditOutcome } from '@medicalink/shared';

export interface IAuditLog extends Document, Omit<SharedAuditLog, '_id' | 'id'> {
  // Mongoose Specific additions if any
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { 
      type: String, 
      enum: Object.values(AuditAction),
      required: true 
    },
    resource: { type: String, required: true },
    resourceId: { type: String },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed }
    },
    outcome: { 
      type: String, 
      enum: Object.values(AuditOutcome),
      required: true 
    },
    timestamp: { type: Date, default: Date.now, required: true }
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for audit log querying
auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, userId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, resource: 1, resourceId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
