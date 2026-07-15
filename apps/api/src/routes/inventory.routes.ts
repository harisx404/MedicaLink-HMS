import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';

const router: Router = Router();

// Protect all inventory routes
router.use(authenticate);

// We allow HOSPITAL_ADMIN, SUPER_ADMIN, and INVENTORY_MANAGER to manage full inventory
// and other roles (like NURSE, DOCTOR) might only be able to view or issue

// --- REPORTS (Must come before /:id) ---
router.get('/reports/stock-valuation', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.getStockValuation);
router.get('/reports/consumption', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.getConsumption);
router.get('/low-stock', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.getLowStock);

// --- TRANSACTIONS ---
router.get('/transactions', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER, Role.NURSE, Role.PHARMACIST]), InventoryController.getTransactions);
router.post('/issue', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER, Role.NURSE, Role.PHARMACIST, Role.LAB_TECHNICIAN, Role.RADIOLOGIST]), InventoryController.issueStock);
router.post('/receive', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.receiveStock);
router.post('/transfer', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.transferStock);

// --- PURCHASE ORDERS ---
router.post('/purchase-orders', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.createPurchaseOrder);
router.get('/purchase-orders', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.getPurchaseOrders);

// --- ASSETS ---
router.get('/assets', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.getAssets);
router.put('/assets/:id', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.updateAsset);

// --- VENDORS ---
router.get('/vendors', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.getVendors);
router.post('/vendors', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.createVendor);

// --- ITEMS ---
router.get('/', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER, Role.NURSE, Role.PHARMACIST, Role.LAB_TECHNICIAN, Role.RADIOLOGIST]), InventoryController.getItems);
router.post('/', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.createItem);
router.put('/:id', authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER]), InventoryController.updateItem);

export default router;
