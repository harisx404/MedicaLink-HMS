import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import * as hrController from '../controllers/hrController';
import * as hrValidator from '../validators/hrValidator';
import { Role } from '@medicalink/shared';

const router: Router = Router();

// Require authentication for all HR routes
router.use(authenticate);

// --- Employee self-service (Accessible by any staff) ---
// We allow doctors, nurses, pharmacists etc. to view their own data
const STAFF_ROLES = [
  Role.HOSPITAL_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN, 
  Role.DOCTOR, Role.NURSE, Role.PHARMACIST, Role.RECEPTIONIST
];

router.post('/attendance/check-in', authorize(STAFF_ROLES), validate(hrValidator.checkInSchema), hrController.checkIn);
router.post('/leaves', authorize(STAFF_ROLES), validate(hrValidator.applyLeaveSchema), hrController.applyLeave);

// --- HR Manager / Admin Routes ---
const HR_ADMIN_ROLES = [Role.HOSPITAL_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN];
router.use(authorize(HR_ADMIN_ROLES));

// Dashboard
router.get('/dashboard', hrController.getHRDashboardStats);

// Employees
router.route('/employees')
  .get(hrController.getEmployees)
  .post(validate(hrValidator.createEmployeeSchema), hrController.createEmployee);

router.route('/employees/:id')
  .get(hrController.getEmployeeById)
  .put(validate(hrValidator.updateEmployeeSchema), hrController.updateEmployee);

// Attendance
router.route('/attendance')
  .get(hrController.getAttendance);
router.post('/attendance/mark', validate(hrValidator.bulkMarkAttendanceSchema), hrController.bulkMarkAttendance);

// Leaves
router.route('/leaves')
  .get(hrController.getLeaves);
router.put('/leaves/:id/approve', hrController.approveLeave);

// Payroll
router.route('/payroll')
  .get(hrController.getPayrolls);
router.post('/payroll/generate', validate(hrValidator.generatePayrollSchema), hrController.generatePayrollDraft);
router.put('/payroll/:id/approve', hrController.approvePayroll);

export default router;
