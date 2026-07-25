import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';
import * as referenceController from '../controllers/referenceController';

const router: Router = Router();

router.use(authenticate);

// Global ICD-10 Search (cached for 5 mins)
router.get('/icd10', cacheMiddleware(300), asyncHandler(referenceController.searchICD10));

// Tenant-specific Drug Formulary Search (cached for 5 mins)
router.get('/drugs', cacheMiddleware(300), asyncHandler(referenceController.searchDrugs));

export default router;
