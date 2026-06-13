import { Router } from 'express';
import { 
  registerEmergencyPatient, 
  getEmergencyPatients, 
  updateTriageStatus,
  getAmbulances,
  updateAmbulanceLocation,
  dispatchAmbulance,
  triggerEmergencyAlert
} from '../controllers/emergencyController';
import { authenticate } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';

const router: Router = Router();

router.use(authenticate, tenantMiddleware);

// Emergency Patients
router.post('/patients', registerEmergencyPatient);
router.get('/patients', getEmergencyPatients);
router.put('/patients/:id/triage', updateTriageStatus);

// Ambulance Tracking
router.get('/ambulances', getAmbulances);
router.put('/ambulances/:id/location', updateAmbulanceLocation);
router.put('/ambulances/:id/dispatch', dispatchAmbulance);

// Alerts (Code Blue, Code Red, MCI)
router.post('/alerts/trigger', triggerEmergencyAlert);

export default router;
