import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';
import { asyncHandler } from '../middlewares/errorHandler';
import * as prescriptionController from '../controllers/prescriptionController';

const router: Router = Router();

router.use(authenticate);

// Create prescription
router.post(
  '/',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR]),
  asyncHandler(prescriptionController.createPrescription)
);

// Get specific prescription
router.get(
  '/:id',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR, Role.NURSE, Role.PHARMACIST, Role.PATIENT, Role.HOSPITAL_ADMIN]),
  asyncHandler(prescriptionController.getPrescription)
);

// Generate PDF
router.get(
  '/:id/pdf',
  authorize([Role.DOCTOR, Role.SENIOR_DOCTOR, Role.NURSE, Role.PHARMACIST, Role.PATIENT]),
  asyncHandler(prescriptionController.generatePrescriptionPdf)
);

export default router;
