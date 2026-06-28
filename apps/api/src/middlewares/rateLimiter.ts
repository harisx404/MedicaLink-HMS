import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';
import { getRedisClient } from '../config/redis';

const rateLimitHandler = (_req: Request, res: Response): void => {
  sendError(res, 'Too many requests — please slow down', 429);
};

// Create a generic store factory to attach to the global redis client
const createRedisStore = (prefix: string) => {
  return new RedisStore({
    // @ts-expect-error - rate-limit-redis expects RedisReply but ioredis call returns unknown
    sendCommand: (...args: string[]) => getRedisClient().call(...args),
    prefix: `rl:${prefix}:`,
  });
};

/** Strict limiter for authentication endpoints (login, register, password reset). */
// Auth: 5 req/15min
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore('auth'),
  message: 'Too many authentication attempts',
});

/** General public API limiter. */
// Public: 100 req/15min
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore('public'),
});

/** Authenticated user limiter — applied to all protected routes. */
// Authenticated: 300 req/min
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore('api'),
});

/** Strict limiter for expensive AI endpoints. */
// AI: 20 req/min
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore('ai'),
  message: 'AI request limit reached — please wait before trying again',
});

/** Limiter for report generation. */
// Reports: 5 req/min
export const reportRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore('reports'),
});

/** Limiter for file uploads. */
// File Uploads: 10 req/min
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore('uploads'),
});
