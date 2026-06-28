export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT'
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface SharedAuditLog {
  _id?: string;
  id?: string;
  tenantId: string;
  userId: string | Record<string, unknown>; // Populated user or string ID
  userRole: string;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  outcome: AuditOutcome;
  timestamp: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
