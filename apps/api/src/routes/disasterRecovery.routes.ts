import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { DisasterRecoveryController } from '../controllers/disasterRecoveryController';

const router: Router = Router();

router.use(authenticate);
router.use(authorize(['SUPER_ADMIN']));

router.get('/status', DisasterRecoveryController.getStatus);
router.post('/failover', DisasterRecoveryController.triggerFailover);

export default router;
