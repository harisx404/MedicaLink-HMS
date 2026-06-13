import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';
import { Role } from '@medicalink/shared';

import * as labController from '../controllers/labController';
import * as testCatalogController from '../controllers/testCatalogController';

const router: Router = Router();

// Apply middleware
router.use(authenticate);
router.use(tenantMiddleware);
router.use(authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN]));

// --- Test Catalog ---
router.get('/tests', testCatalogController.listTestCatalog);
router.post('/tests', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), testCatalogController.createTest);
router.put('/tests/:id', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), testCatalogController.updateTest);
router.get('/tests/:id', testCatalogController.getTestDetails);

// --- Lab Orders ---
router.get('/dashboard/stats', labController.getDashboardStats);
router.get('/reports/workload', labController.getWorkloadReport);
router.get('/orders', labController.listOrders);
router.post('/orders', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR]), labController.createOrder);
router.get('/orders/:id', labController.getOrderDetails);

// --- Lab Workflows ---
router.post('/orders/:id/collect-sample', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.LAB_TECHNICIAN]), labController.collectSample);
router.post('/results/:resultId/enter', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.LAB_TECHNICIAN]), labController.enterResult);
router.post('/orders/:orderId/verify', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.LAB_TECHNICIAN]), labController.verifyResult);
router.post('/results/:id/report', authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.LAB_TECHNICIAN]), labController.generateReportPdf);

export default router;
