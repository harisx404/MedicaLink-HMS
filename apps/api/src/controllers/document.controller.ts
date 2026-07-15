import { Request, Response } from 'express';
import { getDocumentModel } from '../models/document.model';

export class DocumentController {
  static async uploadDocument(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const DocumentModel = getDocumentModel(req.tenantDb);

      const { title, category, patientId, staffId } = req.body;
      const tenantId = req.user?.tenantId;
      const uploadedBy = req.user?.userId;

      // In a real implementation, Multer or similar would handle file upload to S3.
      // Here we simulate it.
      const fileUrl = `/uploads/${Date.now()}-mock-document.pdf`;
      const fileType = 'application/pdf';
      const fileSize = 1024 * 500; // 500kb

      const document = new DocumentModel({
        tenantId,
        title,
        category,
        patientId,
        staffId,
        fileUrl,
        fileType,
        fileSize,
        uploadedBy
      });

      await document.save();
      res.status(201).json({ success: true, data: document });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDocuments(req: Request, res: Response) {
    try {
      if (!req.tenantDb) return res.status(500).json({ success: false, message: 'Tenant DB connection missing' });
      const DocumentModel = getDocumentModel(req.tenantDb);

      const tenantId = req.user?.tenantId;
      const { category, patientId } = req.query;
      const query: any = { tenantId };
      if (category) query.category = category;
      if (patientId) query.patientId = patientId;

      const documents = await DocumentModel.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: documents });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
