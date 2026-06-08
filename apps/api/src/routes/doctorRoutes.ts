import { Router } from 'express';
import { doctorController } from '../controllers/doctorController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';

export const doctorRouter: Router = Router();

// Protect all doctor routes
doctorRouter.use(authenticate);

doctorRouter.get('/', doctorController.listDoctors);
doctorRouter.get('/:id', doctorController.getDoctor);
doctorRouter.get('/:id/schedule', doctorController.getSchedule);

import { getAvailableSlots, getDoctorQueue } from '../controllers/appointmentController';
doctorRouter.get('/:id/slots', authorize([Role.RECEPTIONIST, Role.HOSPITAL_ADMIN, Role.PATIENT]), getAvailableSlots);
doctorRouter.get('/:id/queue', authorize([Role.RECEPTIONIST, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE]), getDoctorQueue);
// Only Super Admins and Hospital Admins can create/update doctors, or Doctor can update their own
doctorRouter.post(
  '/', 
  authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]), 
  doctorController.createDoctor
);

doctorRouter.put(
  '/:id', 
  authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.SENIOR_DOCTOR]), 
  doctorController.updateDoctor
);

doctorRouter.put(
  '/:id/schedule', 
  authorize([Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.SENIOR_DOCTOR]), 
  doctorController.updateSchedule
);

doctorRouter.put(
  '/:id/status', 
  authorize([Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.SENIOR_DOCTOR, Role.RECEPTIONIST]), 
  doctorController.updateStatus
);

export default doctorRouter;
