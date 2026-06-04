import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized, sendForbidden } from '../utils/apiResponse';
import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
  sessionId: string;
}

// Extend the Express Request type to carry decoded JWT data
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenantDb?: import('mongoose').Connection;
    }
  }
}

/**
 * Verifies the JWT access token from the Authorization header.
 * On success, attaches `req.user` with the decoded payload.
 * Checks Redis token blacklist for logged-out tokens.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token = '';
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
      sendUnauthorized(res, 'Invalid or expired token');
      return;
    }

    // Check Redis blacklist (token invalidated on logout)
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`blacklist:${decoded.sessionId}`);
    if (isBlacklisted) {
      sendUnauthorized(res, 'Session has been terminated');
      return;
    }

    req.user = decoded;
    next();
  } catch {
    sendUnauthorized(res, 'Authentication error');
  }
}

/**
 * Role-based access control guard.
 * Usage: router.get('/admin', authenticate, authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN']), handler)
 */
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'You do not have permission to perform this action');
      return;
    }
    next();
  };
}
