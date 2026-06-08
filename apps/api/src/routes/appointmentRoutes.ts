import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';
import {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController';
import { Role } from '@medicalink/shared';

const router: Router = Router();

// Apply auth and tenant DB to all routes
router.use(authenticate);
router.use(tenantMiddleware);

// Booking and Listing
router.post('/', authorize([Role.RECEPTIONIST, Role.HOSPITAL_ADMIN, Role.PATIENT]), bookAppointment);
router.get('/', authorize([Role.RECEPTIONIST, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT]), getAppointments);

// Specific Appointment Actions
router.put('/:id/status', authorize([Role.RECEPTIONIST, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE]), updateAppointmentStatus);

export default router;
