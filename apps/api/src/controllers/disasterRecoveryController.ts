import { Request, Response } from 'express';
import { DisasterRecoveryService } from '../services/disasterRecoveryService';

export class DisasterRecoveryController {
  public static async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await DisasterRecoveryService.getDRStatus();
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check disaster recovery status'
      });
    }
  }

  public static async triggerFailover(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body;
      const result = await DisasterRecoveryService.triggerFailover(reason || 'Manual Super Admin Failover Request');
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initiate failover'
      });
    }
  }
}
