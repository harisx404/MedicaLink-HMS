import { Request, Response } from 'express';
import { ComplianceAuditService } from '../services/complianceAuditService';

export class ComplianceAuditController {
  public static async getAuditReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenantDb!;
      const tenantId = req.user?.tenantId || 'demo-tenant';
      const summary = await ComplianceAuditService.generateAuditReport(tenantDb, tenantId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate compliance audit report'
      });
    }
  }

  public static async exportAuditReportCSV(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenantDb!;
      const tenantId = req.user?.tenantId || 'demo-tenant';
      const csvData = await ComplianceAuditService.generateCSVReport(tenantDb, tenantId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="hipaa-audit-trail.csv"');
      res.status(200).send(csvData);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export CSV audit report'
      });
    }
  }
}
