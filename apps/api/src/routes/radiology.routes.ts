import { Router } from 'express';
import { RadiologyController } from '../controllers/radiology.controller';
import { authenticate, authorize } from '../middlewares/auth';

export const radiologyRoutes: Router = Router();

// Secure all radiology routes
radiologyRoutes.use(authenticate);

// --- Orders ---
radiologyRoutes.post(
  '/orders',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']),
  RadiologyController.createOrder
);

radiologyRoutes.get(
  '/orders',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN', 'RADIOLOGIST']),
  RadiologyController.getOrders
);

radiologyRoutes.get(
  '/orders/:id',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN', 'RADIOLOGIST']),
  RadiologyController.getOrderById
);

radiologyRoutes.put(
  '/orders/:id/status',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'TECHNICIAN', 'RADIOLOGIST']),
  RadiologyController.updateOrderStatus
);

// --- Studies ---
radiologyRoutes.post(
  '/orders/:id/images',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'TECHNICIAN', 'RADIOLOGIST']),
  RadiologyController.uploadDicomStudy
);

radiologyRoutes.get(
  '/orders/:id/study',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN', 'RADIOLOGIST']),
  RadiologyController.getStudyByOrderId
);

// --- Reports ---
radiologyRoutes.post(
  '/orders/:id/reports',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RADIOLOGIST']),
  RadiologyController.saveReport
);

radiologyRoutes.get(
  '/orders/:id/reports',
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN', 'RADIOLOGIST']),
  RadiologyController.getReportByOrderId
);
