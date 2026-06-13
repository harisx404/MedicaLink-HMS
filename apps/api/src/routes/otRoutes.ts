import { Router } from 'express';
import {
  getTheaters,
  createTheater,
  getCases,
  getCaseById,
  scheduleCase,
  updateCaseStatus,
  updateCaseSection
} from '../controllers/otController';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.use(authenticate);

// Theaters
router.get('/theaters', getTheaters);
router.post('/theaters', createTheater);

// OT Cases
router.get('/cases', getCases);
router.post('/cases', scheduleCase);
router.get('/cases/:id', getCaseById);
router.put('/cases/:id/status', updateCaseStatus);
router.put('/cases/:id/section', updateCaseSection);

export default router;
