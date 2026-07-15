import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/', ComplianceController.createRequirement);
router.get('/', ComplianceController.getRequirements);
router.put('/:id/status', ComplianceController.updateStatus);

export default router;
