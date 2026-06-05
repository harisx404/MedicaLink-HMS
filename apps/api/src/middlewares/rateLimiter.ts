import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';
import { RATE_LIMIT } from '../utils/constants';

const rateLimitHandler = (_req: Request, res: Response): void => {
  sendError(res, 'Too many requests — please slow down', 429);
};

/** Strict limiter for authentication endpoints (login, register, password reset). */
export const authRateLimiter = rateLimit({
  ...RATE_LIMIT.AUTH,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many authentication attempts',
});

/** General public API limiter. */
export const publicRateLimiter = rateLimit({
  ...RATE_LIMIT.PUBLIC,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Authenticated user limiter — applied to all protected routes. */
export const apiRateLimiter = rateLimit({
  ...RATE_LIMIT.AUTHENTICATED,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Strict limiter for expensive AI endpoints. */
export const aiRateLimiter = rateLimit({
  ...RATE_LIMIT.AI,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'AI request limit reached — please wait before trying again',
});

/** Limiter for report generation. */
export const reportRateLimiter = rateLimit({
  ...RATE_LIMIT.REPORTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Limiter for file uploads. */
export const uploadRateLimiter = rateLimit({
  ...RATE_LIMIT.UPLOADS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
