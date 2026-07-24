import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

/**
 * Whether to use Upstash REST-based Redis (for serverless) or ioredis (for local dev).
 * When Upstash is configured, we use a lightweight HTTP wrapper instead of TCP connections.
 */
const useUpstash = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

/**
 * Lightweight Upstash Redis HTTP client for serverless environments.
 * Only supports get/set/setex/del — the operations used by cacheService.
 */
class UpstashClient {
  private url: string;
  private token: string;
  public status = 'ready';

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async command(...args: string[]): Promise<unknown> {
    try {
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });
      const data = await response.json();
      return data.result;
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    return (await this.command('GET', key)) as string | null;
  }

  /**
   * Supports ioredis-compatible call signatures:
   *   set(key, value)
   *   set(key, value, 'EX', ttlSeconds)
   *   set(key, value, 'EX', ttlSeconds, 'NX')
   */
  async set(key: string, value: string, ...args: (string | number)[]): Promise<string | null> {
    const cmdArgs = ['SET', key, value, ...args.map(String)];
    const result = await this.command(...cmdArgs);
    // NX flag returns null if key already exists
    if (args.includes('NX') && result === null) return null;
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    await this.command('SET', key, value, 'EX', String(seconds));
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    await this.command('DEL', ...keys);
    return keys.length;
  }

  async keys(pattern: string): Promise<string[]> {
    const result = await this.command('KEYS', pattern);
    return (result as string[]) || [];
  }

  async ping(): Promise<string> {
    return (await this.command('PING')) as string;
  }

  async connect(): Promise<void> {
    this.status = 'ready';
  }

  async quit(): Promise<void> {
    this.status = 'end';
  }
}

const redisOptions = {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 0,
  retryStrategy: (): null => null,
};

/**
 * Returns the singleton Redis client for general caching and data operations.
 * Uses Upstash HTTP client in serverless, ioredis in local dev.
 */
export function getRedisClient(): Redis | UpstashClient {
  if (useUpstash) {
    if (!redisClient) {
      const upstash = new UpstashClient(env.UPSTASH_REDIS_REST_URL!, env.UPSTASH_REDIS_REST_TOKEN!);
      // Store as any to satisfy the Redis type — UpstashClient implements the same interface subset
      redisClient = upstash as any;
      logger.info('Using Upstash Redis (HTTP) for serverless');
    }
    return redisClient!;
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL!, redisOptions);

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
    pubClient = new Redis(env.REDIS_URL!, redisOptions);
    pubClient.on('error', (err) => logger.error('Redis pub error:', err));
  }
  return pubClient;
}

/**
 * Returns the Redis subscriber client for Socket.io pub/sub.
 */
export function getRedisSubClient(): Redis {
  if (!subClient) {
    subClient = new Redis(env.REDIS_URL!, redisOptions);
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

    if (useUpstash) {
      const pong = await (client as UpstashClient).ping();
      if (pong) logger.info('✅ Upstash Redis ping successful');
      return;
    }

    await (client as Redis).connect();
    await (client as Redis).ping();
    logger.info('✅ Redis ping successful');
  } catch {
    logger.warn('Redis connection failed. Running without Redis caching/queues.');
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
