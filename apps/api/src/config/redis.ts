/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

const redisOptions = {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 0,
  retryStrategy: (times: number): number | null => {
    // Return null immediately to stop retrying and prevent terminal spam
    return null;
  },
};

/**
 * Returns the singleton Redis client for general caching and data operations.
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, redisOptions);

    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));

    // Safe overrides for local dev without Redis
    const originalGet = redisClient.get.bind(redisClient);
    const originalSet = redisClient.set.bind(redisClient);
    const originalSetex = redisClient.setex.bind(redisClient);
    const originalDel = redisClient.del.bind(redisClient);

    redisClient.get = async (...args: any[]) => {
      if (redisClient?.status !== 'ready') return null as any;
      return originalGet(...args as [any]);
    };
    redisClient.set = async (...args: any[]) => {
      if (redisClient?.status !== 'ready') return 'OK' as any;
      return originalSet(...args as [any, any]);
    };
    redisClient.setex = async (...args: any[]) => {
      if (redisClient?.status !== 'ready') return 'OK' as any;
      return originalSetex(...args as [any, any, any]);
    };
    redisClient.del = async (...args: any[]) => {
      if (redisClient?.status !== 'ready') return 1 as any;
      return originalDel(...args as [any]);
    };
  }
  return redisClient;
}

/**
 * Returns the Redis publisher client for Socket.io pub/sub across multiple API instances.
 */
export function getRedisPubClient(): Redis {
  if (!pubClient) {
    pubClient = new Redis(env.REDIS_URL, redisOptions);
    pubClient.on('error', (err) => logger.error('Redis pub error:', err));
  }
  return pubClient;
}

/**
 * Returns the Redis subscriber client for Socket.io pub/sub.
 */
export function getRedisSubClient(): Redis {
  if (!subClient) {
    subClient = new Redis(env.REDIS_URL, redisOptions);
    subClient.on('error', (err) => logger.error('Redis sub error:', err));
  }
  return subClient;
}

/**
 * Connects all Redis clients and verifies the connection.
 */
export async function connectRedis(): Promise<void> {
  try {
    const client = getRedisClient();
    // ioredis auto-connects by default, but if lazyConnect is true we call connect()
    // However, if retryStrategy returns null, connect() will throw. Let's catch it.
    await client.connect();
    await client.ping();
    logger.info('✅ Redis ping successful');
  } catch (err) {
    logger.warn('Redis connection failed. Running without Redis caching/queues. Please ensure Redis is running locally on port 6379.');
  }
}

/**
 * Gracefully close all Redis connections.
 */
export async function disconnectRedis(): Promise<void> {
  await Promise.all([
    redisClient?.quit(),
    pubClient?.quit(),
    subClient?.quit(),
  ]);
  logger.info('Redis connections closed');
}
