import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, AuditOutcome } from '@medicalink/shared';
import { logger } from '../utils/logger';

/**
 * Middleware to intercept requests and log them to the AuditLog collection.
 * Required for HIPAA compliance and OWASP A09 (Security Logging and Monitoring Failures).
 */
export const auditLogger = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We only want to log state-changing operations and sensitive reads, 
    // but the middleware can be configured per route.
    
    // Store original send function to intercept response
    const originalSend = res.send;
    
    let outcome = AuditOutcome.FAILURE;

    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        outcome = AuditOutcome.SUCCESS;
      }
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      // Don't audit if there is no tenant or user context yet (e.g. pre-auth endpoints like login)
      // Login/Logout audits should be handled explicitly in their controllers since they establish the context
      if (!req.tenantDb || !req.user) {
        return;
      }

      let action = AuditAction.READ;
      switch (req.method) {
        case 'POST': action = AuditAction.CREATE; break;
        case 'PUT': 
        case 'PATCH': action = AuditAction.UPDATE; break;
        case 'DELETE': action = AuditAction.DELETE; break;
        case 'GET': action = AuditAction.READ; break;
      }

      // If it's just a GET request and outcome is success, maybe we don't log ALL gets to save DB space,
      // UNLESS the resource is sensitive (e.g., patient records). 
      // For this implementation, we will log all intercepted requests as requested by Phase 19.

      try {
        // Global audit log model
        
        // Mask sensitive data in changes (passwords, tokens)
        const maskedBody = maskSensitiveData(req.body);

        await AuditLog.create({
          tenantId: req.user.tenantId,
          userId: req.user.userId,
          userRole: req.user.role,
          userEmail: req.user.sessionId ? 'known-session' : 'unknown', // We don't have email in JWT payload currently, but we have userId
          action,
          resource,
          resourceId: req.params.id || undefined,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          changes: req.method !== 'GET' ? { after: maskedBody } : undefined, // simplified diff
          outcome,
          timestamp: new Date()
        });
      } catch (error) {
        // Fallback to file logger if DB audit fails
        logger.error(`[Audit Failure] Failed to write audit log for user ${req.user.userId}:`, error);
      }
    });

    next();
  };
};

/**
 * Utility to recursively mask sensitive fields in request bodies before logging
 */
function maskSensitiveData(data: unknown): unknown {
  if (!data) return data;
  
  const sensitiveKeys = ['password', 'token', 'secret', 'creditCard', 'cvv'];
  
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskSensitiveData((data as Record<string, unknown>)[key]);
      }
    }
    return masked;
  }
  
  return data;
}
