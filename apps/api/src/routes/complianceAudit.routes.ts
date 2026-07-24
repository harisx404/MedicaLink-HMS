import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { ComplianceAuditController } from '../controllers/complianceAuditController';

const router: Router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN']),
  ComplianceAuditController.getAuditReport
);

router.get(
  '/export',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN']),
  ComplianceAuditController.exportAuditReportCSV
);

export default router;
