import { Router } from 'express';
import {
  registerDonor,
  getDonors,
  addBloodUnit,
  getInventory,
  updateTestResults,
  getInventoryStats,
  createBloodRequest,
  getBloodRequests,
  crossMatchUnit,
  issueUnit
} from '../controllers/bloodBankController';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.use(authenticate);

// Donors
router.post('/donors', registerDonor);
router.get('/donors', getDonors);

// Inventory
router.post('/inventory', addBloodUnit);
router.get('/inventory', getInventory);
router.get('/inventory/stats', getInventoryStats);
router.put('/inventory/:id/tests', updateTestResults);

// Requests
router.post('/requests', createBloodRequest);
router.get('/requests', getBloodRequests);
router.post('/requests/crossmatch', crossMatchUnit);
router.post('/requests/issue', issueUnit);

export default router;
