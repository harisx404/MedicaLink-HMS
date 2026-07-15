import { Request, Response } from 'express';
import { getComplianceModel } from '../models/compliance.model';

export class ComplianceController {
  static async createRequirement(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const ComplianceModel = getComplianceModel(req.tenantDb);

      const tenantId = req.user?.tenantId;
      const requirement = new ComplianceModel({ ...req.body, tenantId });
      await requirement.save();
      res.status(201).json({ success: true, data: requirement });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRequirements(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const ComplianceModel = getComplianceModel(req.tenantDb);

      const tenantId = req.user?.tenantId;
      const { framework } = req.query;
      const query: any = { tenantId };
      if (framework) query.framework = framework;

      const requirements = await ComplianceModel.find(query).sort({ category: 1 });
      res.status(200).json({ success: true, data: requirements });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const ComplianceModel = getComplianceModel(req.tenantDb);

      const { status, notes } = req.body;
      const requirement = await ComplianceModel.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user?.tenantId },
        { 
          status, 
          notes,
          lastReviewedAt: new Date(),
          reviewedBy: req.user?.userId
        },
        { new: true }
      );
      if (!requirement) {
        return res.status(404).json({ success: false, message: 'Requirement not found' });
      }
      res.status(200).json({ success: true, data: requirement });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
