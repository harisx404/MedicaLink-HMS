import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

const TTL = {
  SESSION: 15 * 60, // 15 min
  TENANT_SETTINGS: 60 * 60, // 1 hour
  DOCTOR_SCHEDULE: 60 * 60, // 1 hour
  DRUG_CATALOG: 4 * 60 * 60, // 4 hours
  ICD10: 24 * 60 * 60, // 24 hours
  ANALYTICS: 15 * 60, // 15 min
  PATIENT_BASIC: 30 * 60, // 30 min
};

/**
 * Cache-aside implementation:
 * 1. Checks cache for key
 * 2. If miss, executes fetcher function
 * 3. Stores fetcher result in cache with TTL
 */
export async function getOrSetCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const redis = getRedisClient();

  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
  } catch (error) {
    logger.error(`[CacheService] Redis GET error for key ${key}:`, error);
    // Don't fail the request if cache is down, fallback to fetcher
  }

  const freshData = await fetcher();

  try {
    if (freshData !== undefined && freshData !== null) {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
    }
  } catch (error) {
    logger.error(`[CacheService] Redis SETEX error for key ${key}:`, error);
  }

  return freshData;
}

/**
 * Invalidates specific cache keys (useful for write-through or on-update triggers)
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedisClient();
  try {
    // Note: In production with cluster mode, keys/scan might need careful handling.
    // For specific known keys, it's better to use del directly.
    // Here we assume pattern could be a specific key or a glob pattern for `keys`.
    if (!pattern.includes('*')) {
      await redis.del(pattern);
      return;
    }

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error(`[CacheService] Redis invalidate error for pattern ${pattern}:`, error);
  }
}

export const CacheConfig = {
  TTL,
  // Helper to generate consistent cache keys
  keys: {
    tenantSettings: (tenantId: string) => `tenant:${tenantId}:settings`,
    doctorSchedule: (tenantId: string, doctorId: string) => `tenant:${tenantId}:doctor:${doctorId}:schedule`,
    patientBasic: (tenantId: string, patientId: string) => `tenant:${tenantId}:patient:${patientId}:basic`,
    analyticsDashboard: (tenantId: string) => `tenant:${tenantId}:analytics:executive`,
  }
};
