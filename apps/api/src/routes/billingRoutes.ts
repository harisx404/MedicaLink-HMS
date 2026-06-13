import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';
import { Role } from '@medicalink/shared';

import {
  createBill,
  getPendingCharges,
  listBills,
  getBillDetail,
  updateBill,
  finalizeBill,
  recordPayment,
  voidBill,
  issueCreditNote,
  downloadBillPdf
} from '../controllers/billingController';

import {
  listClaims,
  submitClaim,
  updateClaimStatus,
  listInsurancePanels,
  createInsurancePanel
} from '../controllers/insuranceController';

import {
  dailyCollection,
  revenueAnalytics,
  outstandingReport,
  insuranceReport,
  serviceChargeList,
  createServiceCharge
} from '../controllers/billingReportsController';

const router: Router = Router();

// Apply auth middleware to all routes
router.use(authenticate);
router.use(tenantMiddleware);

// Base access levels (read access)
const readAccessRoles = [
  Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF, 
  Role.RECEPTIONIST, Role.DOCTOR
];

// Write access levels
const writeAccessRoles = [
  Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF
];

// --- Core Billing Routes ---
router.post('/bills', authorize(writeAccessRoles), createBill);
router.get('/bills', authorize(readAccessRoles), listBills);
router.get('/bills/pending-charges', authorize(writeAccessRoles), getPendingCharges);
router.get('/bills/:id', authorize(readAccessRoles), getBillDetail);
router.put('/bills/:id', authorize(writeAccessRoles), updateBill);
router.post('/bills/:id/finalize', authorize(writeAccessRoles), finalizeBill);
router.post('/bills/:id/payment', authorize(writeAccessRoles), recordPayment);
router.post('/bills/:id/void', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), voidBill);
router.post('/bills/:id/credit-note', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), issueCreditNote);
router.get('/bills/:id/pdf', authorize(readAccessRoles), downloadBillPdf);

// --- Insurance Routes ---
router.get('/insurance-claims', authorize(readAccessRoles), listClaims);
router.post('/insurance-claims/:id/submit', authorize(writeAccessRoles), submitClaim);
router.put('/insurance-claims/:id', authorize(writeAccessRoles), updateClaimStatus);

router.get('/panels', authorize(readAccessRoles), listInsurancePanels);
router.post('/panels', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), createInsurancePanel);

// --- Reports & Analytics Routes ---
const reportsAccessRoles = [Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF];
router.get('/reports/daily-collection', authorize(reportsAccessRoles), dailyCollection);
router.get('/reports/revenue', authorize(reportsAccessRoles), revenueAnalytics);
router.get('/reports/outstanding', authorize(reportsAccessRoles), outstandingReport);
router.get('/reports/insurance', authorize(reportsAccessRoles), insuranceReport);

// --- Service Charges Master ---
router.get('/services', authorize(readAccessRoles), serviceChargeList);
router.post('/services', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), createServiceCharge);

export default router;
