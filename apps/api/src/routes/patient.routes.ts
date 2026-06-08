import { Router } from 'express';
import { patientController } from '../controllers/patientController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import { 
  createPatientSchema, 
  updatePatientSchema, 
  getPatientByIdSchema, 
  searchPatientSchema 
} from '../validators/patientValidator';
import { Role } from '@medicalink/shared';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// Only specific roles can manage patients
const allowedRoles = [Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST];

router.use(authenticate);
router.use(apiRateLimiter);

router.post(
  '/',
  authorize(allowedRoles),
  validate(createPatientSchema),
  patientController.registerPatient
);

router.get(
  '/',
  authorize(allowedRoles),
  validate(searchPatientSchema),
  patientController.getPatients
);

router.get(
  '/search',
  authorize(allowedRoles),
  validate(searchPatientSchema),
  patientController.searchPatients
);

router.get(
  '/:id',
  authorize(allowedRoles),
  validate(getPatientByIdSchema),
  patientController.getPatientById
);

router.put(
  '/:id',
  authorize(allowedRoles),
  validate(updatePatientSchema),
  patientController.updatePatient
);

router.delete(
  '/:id',
  authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), // Only admins can soft delete
  validate(getPatientByIdSchema),
  patientController.deletePatient
);

// Related data endpoints (stubs for future modules)
router.get('/:id/visits', authorize(allowedRoles), patientController.getPatientVisits);
router.get('/:id/bills', authorize(allowedRoles), patientController.getPatientBills);
router.get('/:id/prescriptions', authorize(allowedRoles), patientController.getPatientPrescriptions);
router.get('/:id/lab-results', authorize(allowedRoles), patientController.getPatientLabResults);

router.post('/:id/documents', authorize(allowedRoles), patientController.uploadDocuments);
router.get('/:id/qr-code', authorize(allowedRoles), patientController.generateQrCode);
router.get('/:id/clinical-summary', authorize(allowedRoles), patientController.generateClinicalSummary);

router.post(
  '/:id/portal/enable',
  authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST]),
  validate(getPatientByIdSchema),
  patientController.enablePortal
);

router.post(
  '/:id/chat',
  authorize(allowedRoles), // in a real portal, this would use a Patient Role and Token
  patientController.chatWithAssistant
);

export default router;
