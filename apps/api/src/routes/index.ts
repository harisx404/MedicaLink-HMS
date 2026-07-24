import { Router, Request, Response } from 'express';
import { APP_VERSION } from '../utils/constants';
import { sendSuccess } from '../utils/apiResponse';


import authRouter from './auth.routes';
import superAdminRouter from './superAdmin.routes';
import adminRouter from './admin.routes';
import patientRouter from './patient.routes';
import doctorRouter from './doctorRoutes';
import appointmentRouter from './appointmentRoutes';
import consultationRouter from './consultationRoutes';
import prescriptionRouter from './prescriptionRoutes';
import referenceRouter from './referenceRoutes';
import pharmacyRouter from './pharmacyRoutes';
import labRouter from './labRoutes';
import billingRouter from './billingRoutes';
import emergencyRouter from './emergencyRoutes';
import icuRouter from './icuRoutes';
import otRoutes from './otRoutes';
import bloodBankRoutes from './bloodBankRoutes';
import telemedicineRoutes from './telemedicineRoutes';
import aiRoutes from './aiRoutes';
import analyticsRoutes from './analyticsRoutes';
import hrRoutes from './hrRoutes';
import nursingRoutes from './nursing.routes';
import { notificationRoutes } from './notificationRoutes';
import { messageRoutes } from './messageRoutes';
import { radiologyRoutes } from './radiology.routes';
import inventoryRoutes from './inventory.routes';
import fhirRoutes from './fhir.routes';
import documentRoutes from './document.routes';
import consentRoutes from './consent.routes';
import complianceRoutes from './compliance.routes';
import complianceAuditRoutes from './complianceAudit.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/super-admin', superAdminRouter);
router.use('/admin', adminRouter);
router.use('/patients', patientRouter);
router.use('/doctors', doctorRouter);
router.use('/appointments', appointmentRouter);
router.use('/consultations', consultationRouter);
router.use('/prescriptions', prescriptionRouter);
router.use('/references', referenceRouter);
router.use('/pharmacy', pharmacyRouter);
router.use('/lab', labRouter);
router.use('/billing', billingRouter);
router.use('/emergency', emergencyRouter);
router.use('/icu', icuRouter);
router.use('/ot', otRoutes);
router.use('/bloodbank', bloodBankRoutes);
router.use('/telemedicine', telemedicineRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/hr', hrRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/nursing', nursingRoutes);
router.use('/radiology', radiologyRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/fhir', fhirRoutes);
router.use('/documents', documentRoutes);
router.use('/consents', consentRoutes);
router.use('/compliance', complianceRoutes);
router.use('/compliance/audit-report', complianceAuditRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, 'MedicaLink HMS API is healthy', {
    status: 'healthy',
    version: APP_VERSION,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API Info ─────────────────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, 'MedicaLink HMS API', {
    name: 'MedicaLink HMS',
    version: APP_VERSION,
    documentation: '/api/docs',
    health: '/api/v1/health',
  });
});

export default router;
