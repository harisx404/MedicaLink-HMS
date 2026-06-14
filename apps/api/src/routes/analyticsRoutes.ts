import { Router } from 'express';
import { Role } from '@medicalink/shared';
import { authenticate, authorize } from '../middlewares/auth';
import { 
  getExecutiveDashboard, 
  getClinicalAnalytics, 
  getOperationalAnalytics, 
  getFinancialAnalytics, 
  generateCustomReport 
} from '../controllers/analyticsController';

const router: Router = Router();

// Only Admins and Super Admins can access analytics
router.use(authenticate);
router.use(authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN]));

router.get('/executive', getExecutiveDashboard);
router.get('/clinical', getClinicalAnalytics);
router.get('/operational', getOperationalAnalytics);
router.get('/financial', getFinancialAnalytics);
router.post('/custom', generateCustomReport);

export default router;
