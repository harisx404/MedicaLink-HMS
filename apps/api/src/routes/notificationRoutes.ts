import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  getTemplates,
  updateTemplate,
  createTemplate,
  triggerTestNotification
} from '../controllers/notificationController';
import { Role } from '@medicalink/shared';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User notification routes
router.get('/', getNotifications);
router.post('/mark-read', markAsRead);
router.delete('/:id', deleteNotification);

// Testing route
router.post('/test', triggerTestNotification);

// Admin-only template management
router.use(authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]));
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.patch('/templates/:id', updateTemplate);

export const notificationRoutes: Router = router;
