import { Router } from 'express';
import { ConsentController } from '../controllers/consent.controller';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/', ConsentController.createConsent);
router.get('/', ConsentController.getConsents);
router.post('/:id/sign', ConsentController.signConsent);

export default router;
