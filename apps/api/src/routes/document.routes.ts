import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/', DocumentController.uploadDocument);
router.get('/', DocumentController.getDocuments);

export default router;
