import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';
import { Role } from '@medicalink/shared';

// Controllers
import * as pharmacyController from '../controllers/pharmacyController';
import * as drugController from '../controllers/drugController';
import * as purchaseOrderController from '../controllers/purchaseOrderController';
import * as pharmacyAnalyticsController from '../controllers/pharmacyAnalyticsController';

const router: Router = Router();

// Apply middleware
router.use(authenticate);
router.use(tenantMiddleware);
router.use(authorize([Role.PHARMACIST, Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN]));

// --- Pharmacy Workflow ---
router.get('/dashboard', pharmacyController.getPharmacyDashboard);
router.get('/queue', pharmacyController.getPrescriptionQueue);
router.post('/dispense', pharmacyController.dispenseDrugs);
router.get('/dispensing/:id', pharmacyController.getDispensingRecord);
router.post('/return', pharmacyController.processReturn);

// --- Drug Inventory ---
router.get('/drugs', drugController.listDrugs);
router.post('/drugs', drugController.createDrug);
router.put('/drugs/:id', drugController.updateDrug);
router.get('/drugs/:id/batches', drugController.getDrugBatches);
router.get('/inventory/low-stock', drugController.getLowStockDrugs);
router.get('/inventory/expiring', drugController.getExpiringDrugs);
router.post('/drugs/:id/adjust-stock', drugController.adjustStock);

// --- Purchase Orders & Receiving ---
router.get('/purchase-orders', purchaseOrderController.listPurchaseOrders);
router.post('/purchase-orders', purchaseOrderController.createPurchaseOrder);
router.put('/purchase-orders/:id', purchaseOrderController.updatePurchaseOrder);
router.post('/purchase-orders/:id/receive', purchaseOrderController.receiveGoods);

// --- Suppliers ---
router.get('/suppliers', purchaseOrderController.listSuppliers);
router.post('/suppliers', purchaseOrderController.createSupplier);
router.put('/suppliers/:id', purchaseOrderController.updateSupplier);

// --- Analytics / Reports ---
router.get('/reports/sales', pharmacyAnalyticsController.getSalesReport);
router.get('/reports/inventory', pharmacyAnalyticsController.getInventoryValuationReport);
router.get('/reports/expiry', pharmacyAnalyticsController.getExpiryReport);

export default router;
