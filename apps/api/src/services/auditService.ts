import { AuditLog } from '../models';
import { logger } from '../utils/logger';

export interface AuditDetails {
  actor: string;
  actorEmail?: string;
  actorRole?: string;
  tenantId?: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export const auditService = {
  /**
   * Log an authentication or authorization event.
   */
  async logAuthEvent(action: string, details: AuditDetails): Promise<void> {
    try {
      await AuditLog.create({
        action,
        ...details,
      });
    } catch (error) {
      // We don't want audit logging failure to break the main application flow,
      // but we must log it as a critical system error.
      logger.error('[AuditService] Failed to create audit log', error);
    }
  },

  /**
   * Retrieve audit logs with basic pagination.
   */
  async getAuditLogs(
    filters: Record<string, unknown>,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      AuditLog.find(filters).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filters),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },
};
