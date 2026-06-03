import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Send a 200 success response.
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  } satisfies ApiResponsePayload<T>);
}

/**
 * Send a paginated list response.
 */
export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number
): Response {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  } satisfies ApiResponsePayload<T[]>);
}

/**
 * Send a generic error response.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Array<{ field: string; message: string }>
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  } satisfies ApiResponsePayload);
}

/**
 * Send a 201 Created response.
 */
export function sendCreated<T>(res: Response, message: string, data?: T): Response {
  return sendSuccess(res, message, data, 201);
}

/**
 * Send a 401 Unauthorized response.
 */
export function sendUnauthorized(res: Response, message = 'Authentication required'): Response {
  return sendError(res, message, 401);
}

/**
 * Send a 403 Forbidden response.
 */
export function sendForbidden(res: Response, message = 'Access denied'): Response {
  return sendError(res, message, 403);
}

/**
 * Send a 404 Not Found response.
 */
export function sendNotFound(res: Response, resource = 'Resource'): Response {
  return sendError(res, `${resource} not found`, 404);
}

/**
 * Send a 409 Conflict response.
 */
export function sendConflict(res: Response, message: string): Response {
  return sendError(res, message, 409);
}
