import { Router } from 'express';
import { 
  admitToICU, 
  getICUPatients, 
  getICUPatientById,
  addVitals,
  updateVentilator,
  updateFluidBalance
} from '../controllers/icuController';
import { authenticate } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';

const router: Router = Router();

router.use(authenticate, tenantMiddleware);

// ICU Patients
router.post('/patients', admitToICU);
router.get('/patients', getICUPatients);
router.get('/patients/:id', getICUPatientById);

// Patient Monitoring
router.post('/patients/:id/vitals', addVitals);
router.put('/patients/:id/ventilator', updateVentilator);
router.post('/patients/:id/fluids', updateFluidBalance);

export default router;
