import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import * as referenceController from '../controllers/referenceController';

const router: Router = Router();

router.use(authenticate);

// Global ICD-10 Search
router.get('/icd10', asyncHandler(referenceController.searchICD10));

// Tenant-specific Drug Formulary Search
router.get('/drugs', asyncHandler(referenceController.searchDrugs));

export default router;
