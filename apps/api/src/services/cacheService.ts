import { getRedisClient } from '../config/redis';

export class CacheService {
  /**
   * Get cached data or execute fallback fetcher and cache result
   */
  public static async getOrSetCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        const cachedData = await redis.get(key);
        if (cachedData) {
          return JSON.parse(cachedData) as T;
        }
      }
    } catch (error) {
      console.warn(`[Redis Cache Warning] Failed to read key: ${key}`, error);
    }

    const result = await fetcher();

    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready' && result) {
        await redis.setex(key, ttlSeconds, JSON.stringify(result));
      }
    } catch (error) {
      console.warn(`[Redis Cache Warning] Failed to write key: ${key}`, error);
    }

    return result;
  }

  /**
   * Invalidate specific cache key
   */
  public static async invalidateCache(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        await redis.del(key);
      }
    } catch (error) {
      console.warn(`[Redis Cache Warning] Failed to delete key: ${key}`, error);
    }
  }

  /**
   * Invalidate cache keys matching pattern
   */
  public static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch (error) {
      console.warn(`[Redis Cache Warning] Failed to clear pattern: ${pattern}`, error);
    }
  }
}
