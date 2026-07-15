import { Request, Response, NextFunction } from 'express';
import { RadiologyService } from '../services/radiology.service';
import { sendSuccess } from '../utils/apiResponse';

export class RadiologyController {
  
  // --- Orders ---
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        doctor: req.user?.userId
      };
      const order = await RadiologyService.createOrder(req.tenantDb!, req.user!.tenantId, data);
      sendSuccess(res, 'Radiology order created successfully', order, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await RadiologyService.getOrders(req.tenantDb!, req.user!.tenantId, req.query);
      sendSuccess(res, 'Radiology orders retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const order = await RadiologyService.getOrderById(req.tenantDb!, req.user!.tenantId, orderId);
      sendSuccess(res, 'Radiology order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const { status } = req.body;
      const order = await RadiologyService.updateOrderStatus(req.tenantDb!, req.user!.tenantId, orderId, status, req.user?.userId);
      sendSuccess(res, 'Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  }

  // --- Studies ---
  static async uploadDicomStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const study = await RadiologyService.uploadDicomStudy(req.tenantDb!, req.user!.tenantId, orderId, req.body);
      sendSuccess(res, 'DICOM study uploaded successfully', study, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getStudyByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const study = await RadiologyService.getStudyByOrderId(req.tenantDb!, req.user!.tenantId, orderId);
      sendSuccess(res, 'DICOM study metadata retrieved successfully', study);
    } catch (error) {
      next(error);
    }
  }

  // --- Reports ---
  static async saveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const report = await RadiologyService.saveReport(req.tenantDb!, req.user!.tenantId, orderId, req.body, req.user!.userId);
      sendSuccess(res, 'Report saved successfully', report, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getReportByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const report = await RadiologyService.getReportByOrderId(req.tenantDb!, req.user!.tenantId, orderId);
      sendSuccess(res, 'Report retrieved successfully', report);
    } catch (error) {
      next(error);
    }
  }
}
