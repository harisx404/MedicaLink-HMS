import { Request, Response } from 'express';
import { getConsentModel } from '../models/consent.model';

export class ConsentController {
  static async createConsent(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const ConsentModel = getConsentModel(req.tenantDb);

      const tenantId = req.user?.tenantId;
      const consent = new ConsentModel({ ...req.body, tenantId });
      await consent.save();
      res.status(201).json({ success: true, data: consent });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async signConsent(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const ConsentModel = getConsentModel(req.tenantDb);

      const { signatureData, signedBy } = req.body;
      const consent = await ConsentModel.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user?.tenantId },
        { 
          isSigned: true, 
          signatureData, 
          signedBy, 
          signedAt: new Date() 
        },
        { new: true }
      );
      if (!consent) {
        return res.status(404).json({ success: false, message: 'Consent not found' });
      }
      res.status(200).json({ success: true, data: consent });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getConsents(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const ConsentModel = getConsentModel(req.tenantDb);

      const tenantId = req.user?.tenantId;
      const { patientId } = req.query;
      const query: any = { tenantId };
      if (patientId) query.patientId = patientId;

      const consents = await ConsentModel.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: consents });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
