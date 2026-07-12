import { describe, it, expect, vi } from 'vitest';
import { AppError, errorHandler, asyncHandler } from '../../middlewares/errorHandler';
import type { Request, Response, NextFunction } from 'express';

// Helper to create mock Express objects
function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function createMockReq(overrides: Partial<Request> = {}) {
  return { url: '/test', method: 'GET', ...overrides } as Request;
}

describe('AppError', () => {
  it('creates an error with default 500 status code', () => {
    const error = new AppError('Something failed');
    expect(error.message).toBe('Something failed');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('creates an error with custom status code', () => {
    const error = new AppError('Not found', 404);
    expect(error.statusCode).toBe(404);
  });

  it('is an instance of Error', () => {
    const error = new AppError('Test');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('errorHandler middleware', () => {
  it('handles AppError with correct status code', () => {
    const res = createMockRes();
    const req = createMockReq();
    const next = vi.fn() as NextFunction;

    errorHandler(new AppError('Forbidden', 403), req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Forbidden' })
    );
  });

  it('handles JWT errors as 401', () => {
    const res = createMockRes();
    const req = createMockReq();
    const next = vi.fn() as NextFunction;

    const jwtError = new Error('invalid token');
    jwtError.name = 'JsonWebTokenError';

    errorHandler(jwtError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('handles expired token errors as 401', () => {
    const res = createMockRes();
    const req = createMockReq();
    const next = vi.fn() as NextFunction;

    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';

    errorHandler(expiredError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('asyncHandler', () => {
  it('calls the async function with req, res, next', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn() as NextFunction;

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it('forwards errors to next() when async function throws', async () => {
    const error = new Error('Database error');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn() as NextFunction;

    await wrapped(req, res, next);
    // Give the Promise.resolve().catch() a tick to propagate
    await new Promise((r) => setTimeout(r, 10));

    expect(next).toHaveBeenCalledWith(error);
  });
});
