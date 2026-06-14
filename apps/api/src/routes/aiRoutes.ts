import { Router } from 'express';
import { Role } from '@medicalink/shared';
import { authenticate, authorize } from '../middlewares/auth';
import { 
  chatWithAssistant, 
  suggestDiagnosis, 
  checkDrugInteractions, 
  calculateDosage, 
  getDrugInfo, 
  voiceToSoap, 
  getPatientRiskScore, 
  getLabTrendsSummary, 
  generateDischargeSummary 
} from '../controllers/aiController';

const router: Router = Router();

// Protect all AI routes
router.use(authenticate);

// Clinical Assistant
router.post('/clinical-assistant', chatWithAssistant);

// Diagnosis Assistance
router.post('/suggest-diagnosis', authorize([Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN]), suggestDiagnosis);

// Drug Intelligence
router.post('/drug-interactions', checkDrugInteractions);
router.post('/calculate-dosage', calculateDosage);
router.get('/drug-info/:drugName', getDrugInfo);

// Voice-to-SOAP
router.post('/voice-to-soap', authorize([Role.DOCTOR, Role.SENIOR_DOCTOR]), voiceToSoap);

// Predictive Analytics & Summarization
router.post('/patient-risk', getPatientRiskScore);
router.post('/summarize-labs', getLabTrendsSummary);
router.post('/discharge-summary', authorize([Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN]), generateDischargeSummary);

export default router;
