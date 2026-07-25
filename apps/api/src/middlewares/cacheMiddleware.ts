import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';

export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const tenantId = req.user?.tenantId || 'global';
    const cacheKey = `cache:${tenantId}:${req.originalUrl || req.url}`;

    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        const cachedResponse = await redis.get(cacheKey);
        if (cachedResponse) {
          res.setHeader('X-Cache-Status', 'HIT');
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(cachedResponse);
          return;
        }
      }
    } catch (error) {
      console.warn(`[Cache Middleware Warning] Error checking key ${cacheKey}`, error);
    }

    // Intercept res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      const redis = getRedisClient();
      if (res.statusCode >= 200 && res.statusCode < 300 && redis && redis.status === 'ready') {
        redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err: unknown) => {
          console.warn(`[Cache Middleware Warning] Failed to write cache key ${cacheKey}`, err);
        });
      }
      res.setHeader('X-Cache-Status', 'MISS');
      return originalJson(body);
    };

    next();
  };
};
