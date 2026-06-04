import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { extractTenantSlug } from '../utils/helpers';
import { getTenantDb } from '../config/db';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { Tenant } from '../models/Tenant';
import { CACHE_TTL } from '../utils/constants';

/**
 * Resolves the hospital tenant from the request's subdomain or X-Tenant-Slug header.
 * Fetches and caches tenant metadata in Redis, then attaches a tenant DB connection
 * to `req.tenantDb` for downstream controllers.
 *
 * This middleware must run after the `authenticate` middleware on tenant-scoped routes.
 */
export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = extractTenantSlug(
      req.hostname,
      req.headers['x-tenant-slug'] as string | undefined
    );

    if (!slug) {
      sendError(res, 'Tenant identifier missing', 400);
      return;
    }

    // Validate tenant exists and is active via Redis cache first
    const redis = getRedisClient();
    const cacheKey = `tenant:${slug}`;
    const cached = await redis.get(cacheKey);

    if (!cached) {
      // Lookup in main DB
      const tenant = await Tenant.findBySlug(slug);
      if (!tenant) {
        sendError(res, 'Hospital not found or subscription inactive', 404);
        return;
      }
      
      // Cache for 1 hour
      await redis.setex(cacheKey, CACHE_TTL.TENANT_SETTINGS, JSON.stringify({
        id: tenant._id,
        slug: tenant.slug,
        dbName: tenant.database.name
      }));
    }

    // Attach tenant DB connection
    const tenantDb = await getTenantDb(slug);
    req.tenantDb = tenantDb;

    // Validate that the authenticated user belongs to this tenant
    if (req.user && req.user.tenantSlug !== slug && req.user.role !== 'SUPER_ADMIN') {
      sendError(res, 'Access denied for this hospital', 403);
      return;
    }

    next();
  } catch (err) {
    logger.error('[Tenant Middleware] Error:', err);
    sendError(res, 'Tenant resolution failed', 500);
  }
}
