import { Router } from 'express';
import { tenantController } from '../controllers/tenantController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// All super-admin routes require authentication and SUPER_ADMIN role
router.use(authenticate);
router.use(authorize([Role.SUPER_ADMIN]));

router.get('/tenants', tenantController.listTenants);
router.post('/tenants', tenantController.createTenant);
router.get('/tenants/:id', tenantController.getTenant);
router.put('/tenants/:id', tenantController.updateTenant);
router.delete('/tenants/:id', tenantController.deactivateTenant);
router.post('/tenants/:id/feature-flags', tenantController.updateFeatureFlags);

export default router;
