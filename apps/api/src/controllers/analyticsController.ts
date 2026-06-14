import { Request, Response } from 'express';
// Removed unused import
import { sendSuccess, sendError } from '../utils/apiResponse';
import { 
  getExecutiveDashboardMetrics, 
  getClinicalMetrics, 
  getOperationalMetrics, 
  getFinancialMetrics 
} from '../services/analyticsService';

export const getExecutiveDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getExecutiveDashboardMetrics(req.tenantDb!);
    sendSuccess(res, 'Executive dashboard metrics retrieved', data);
  } catch (error: any) {
    sendError(res, 'Failed to retrieve executive metrics', 500);
  }
};

export const getClinicalAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await getClinicalMetrics(req.tenantDb!);
    sendSuccess(res, 'Clinical analytics retrieved', data);
  } catch (error: any) {
    sendError(res, 'Failed to retrieve clinical analytics', 500);
  }
};

export const getOperationalAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await getOperationalMetrics(req.tenantDb!);
    sendSuccess(res, 'Operational analytics retrieved', data);
  } catch (error: any) {
    sendError(res, 'Failed to retrieve operational analytics', 500);
  }
};

export const getFinancialAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await getFinancialMetrics(req.tenantDb!);
    sendSuccess(res, 'Financial analytics retrieved', data);
  } catch (error: any) {
    sendError(res, 'Failed to retrieve financial analytics', 500);
  }
};

export const generateCustomReport = async (req: Request, res: Response) => {
  try {
    // const { type, dateRange, format } = req.body;
    // Basic mock implementation for the export
    sendSuccess(res, 'Custom report generated', { url: '/mock-download.pdf' });
  } catch (error: any) {
    sendError(res, 'Failed to generate custom report', 500);
  }
};
