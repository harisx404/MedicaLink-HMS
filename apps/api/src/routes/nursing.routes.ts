import { Router } from 'express';
import { NursingController } from '../controllers/nursing.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// All nursing routes require authentication and NURSE/ADMIN roles
router.use(authenticate);
router.use(authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE]));

// --- Vitals ---
router.post('/vitals', NursingController.recordVitals);
router.get('/vitals/:patientId', NursingController.getPatientVitals);

// --- Nursing Notes ---
router.post('/notes', NursingController.addNursingNote);
router.get('/notes/:patientId', NursingController.getPatientNotes);

// --- MAR (Medication Administration Record) ---
router.post('/mar', NursingController.administerMedication);
router.get('/mar/:patientId', NursingController.getPatientMAR);

// --- Handovers ---
router.post('/handover', NursingController.submitHandover);
router.get('/handover/:wardId', NursingController.getWardHandovers);

export default router;
