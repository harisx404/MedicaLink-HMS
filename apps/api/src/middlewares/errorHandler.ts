import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response {
  // ── Zod Validation Error ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 'Validation failed', 422, errors);
  }

  // ── Operational AppError ──────────────────────────────────────────────────
  if (err instanceof AppError) {
    if (env.NODE_ENV === 'development') {
      logger.error(`[AppError] ${err.message}`, { stack: err.stack });
    }
    return sendError(res, err.message, err.statusCode);
  }

  // ── Mongoose Duplicate Key ────────────────────────────────────────────────
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] ?? 'field';
    return sendError(res, `${field} already exists`, 409);
  }

  // ── Mongoose Cast Error (invalid ObjectId) ────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // ── Mongoose Validation Error ─────────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 422, errors);
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired', 401);
  }

  // ── Unknown / Programming Error ───────────────────────────────────────────
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  const message =
    env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;

  return sendError(res, message, 500);
}

/**
 * Wraps async route handlers to automatically forward errors to errorHandler.
 * Eliminates try-catch boilerplate in every controller.
 */
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
