import { Request, Response, NextFunction } from 'express';
import { sendForbidden, sendUnauthorized } from '../utils/apiResponse';

/**
 * Ensures the authenticated user can only access their own tenant's data.
 * OWASP A01: Broken Access Control
 */
export const verifyTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  // Check if trying to access a tenant ID in the route params that isn't theirs
  if (req.params.tenantId && req.params.tenantId !== req.user.tenantId) {
    sendForbidden(res, 'Access denied. You can only access resources belonging to your tenant.');
    return;
  }

  // Check if body contains a tenantId that isn't theirs (prevent IDOR)
  if (req.body && req.body.tenantId && req.body.tenantId !== req.user.tenantId) {
    sendForbidden(res, 'Access denied. Cross-tenant data creation is forbidden.');
    return;
  }

  next();
};

/**
 * Attribute-Based Access Control (ABAC) helper for complex rules.
 * e.g., A doctor can only edit their own appointments, unless they are an admin.
 */
export const canEditResource = (resourceOwnerId: string, allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    const isOwner = req.user.userId === resourceOwnerId;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      sendForbidden(res, 'Access denied to this resource.');
      return;
    }

    next();
  };
};
