import { Router } from 'express';
import { FhirController } from '../controllers/fhir.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';

const router: Router = Router();

// In a real system, FHIR endpoints are usually secured by OAuth2 / SMART on FHIR.
// For this HMS, we'll secure it requiring high-level authentication (Admin/System roles)
router.use(authenticate);

const FHIR_ACCESS_ROLES = [Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.NURSE];

// Patient Resources
router.get('/Patient', authorize(FHIR_ACCESS_ROLES), FhirController.searchPatients);
router.get('/Patient/:id', authorize(FHIR_ACCESS_ROLES), FhirController.getPatientById);
router.get('/Patient/:id/$everything', authorize(FHIR_ACCESS_ROLES), FhirController.getPatientEverything);

// Observation Resources (Vitals, Labs)
router.get('/Observation', authorize(FHIR_ACCESS_ROLES), FhirController.searchObservations);

// HL7 v2 Webhook
// NOTE: Raw text parser middleware should be added to Express to accept text/plain for this endpoint
router.post('/hl7', authorize(FHIR_ACCESS_ROLES), FhirController.receiveHl7Message);

export default router;
