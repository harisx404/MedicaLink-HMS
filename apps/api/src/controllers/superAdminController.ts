import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { superAdminService } from '../services/superAdminService';

import { RequestHandler } from 'express';

export const superAdminController: {
  getStats: RequestHandler;
  getAnalytics: RequestHandler;
  getSystemHealth: RequestHandler;
  getAuditLogs: RequestHandler;
  impersonateTenant: RequestHandler;
} = {
  getStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await superAdminService.getDashboardStats();
    return sendSuccess(res, 'Super admin stats retrieved successfully', stats);
  }),

  getAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const analytics = await superAdminService.getAnalytics();
    return sendSuccess(res, 'Super admin analytics retrieved successfully', analytics);
  }),

  getSystemHealth: asyncHandler(async (req: Request, res: Response) => {
    const health = await superAdminService.getSystemHealth();
    return sendSuccess(res, 'System health retrieved successfully', health);
  }),

  getAuditLogs: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const logs = await superAdminService.getAuditLogs(limit, skip);
    return sendSuccess(res, 'Audit logs retrieved successfully', logs);
  }),

  impersonateTenant: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.params.tenantId as string;
    const result = await superAdminService.impersonateTenant(tenantId);
    return sendSuccess(res, 'Impersonation token generated', result);
  })
};
