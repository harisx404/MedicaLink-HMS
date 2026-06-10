import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';
import { asyncHandler } from '../middlewares/errorHandler';
import * as consultationController from '../controllers/consultationController';

const router: Router = Router();

router.use(authenticate);

// Start consultation
router.post(
  '/',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR]),
  asyncHandler(consultationController.createConsultation)
);

// Get specific consultation
router.get(
  '/:id',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR, Role.NURSE, Role.HOSPITAL_ADMIN]),
  asyncHandler(consultationController.getConsultation)
);

// Auto-save consultation
router.put(
  '/:id',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR]),
  asyncHandler(consultationController.updateConsultation)
);

// Sign & Finalize
router.post(
  '/:id/sign',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR]),
  asyncHandler(consultationController.signConsultation)
);

// Get patient's consultation history
router.get(
  '/patient/:patientId',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR, Role.NURSE, Role.PATIENT]),
  asyncHandler(consultationController.getPatientConsultations)
);

export default router;
