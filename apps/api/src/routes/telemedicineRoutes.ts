import { Router } from 'express';
import { getSessions, getSessionById, createSession, updateSessionStatus } from '../controllers/telemedicineController';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:id', getSessionById);
router.put('/sessions/:id/status', updateSessionStatus);

export default router;
