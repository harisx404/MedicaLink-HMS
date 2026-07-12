import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError, sendCreated, sendPaginated, sendNotFound } from '../../utils/apiResponse';
import type { Response } from 'express';

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('API Response Utilities', () => {
  describe('sendSuccess', () => {
    it('returns 200 status with success shape', () => {
      const res = createMockRes();
      sendSuccess(res, 'Operation successful', { id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
        data: { id: 1 },
      });
    });

    it('returns custom status code when provided', () => {
      const res = createMockRes();
      sendSuccess(res, 'Created', null, 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('returns error shape with default 400 status', () => {
      const res = createMockRes();
      sendError(res, 'Validation failed');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
        })
      );
    });

    it('returns custom status code', () => {
      const res = createMockRes();
      sendError(res, 'Not found', 404);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('includes field errors when provided', () => {
      const res = createMockRes();
      const errors = [{ field: 'email', message: 'Email is required' }];
      sendError(res, 'Validation failed', 422, errors);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors,
        })
      );
    });
  });

  describe('sendCreated', () => {
    it('returns 201 status', () => {
      const res = createMockRes();
      sendCreated(res, 'Patient created', { id: 'abc' });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Patient created',
          data: { id: 'abc' },
        })
      );
    });
  });

  describe('sendPaginated', () => {
    it('returns paginated response with correct page count', () => {
      const res = createMockRes();
      const data = [{ id: 1 }, { id: 2 }];
      sendPaginated(res, 'Patients retrieved', data, 25, 1, 10);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          pagination: {
            total: 25,
            page: 1,
            limit: 10,
            pages: 3,
          },
        })
      );
    });
  });

  describe('sendNotFound', () => {
    it('returns 404 with resource name', () => {
      const res = createMockRes();
      sendNotFound(res, 'Patient');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Patient not found',
        })
      );
    });
  });
});
