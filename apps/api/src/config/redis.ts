import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

const redisOptions = {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number): number | null => {
    if (times > 10) {
      logger.error('Redis max retries reached. Giving up.');
      return null;
    }
    return Math.min(times * 100, 3000);
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
  const client = getRedisClient();
  await client.connect();
  await client.ping();
  logger.info('✅ Redis ping successful');
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
