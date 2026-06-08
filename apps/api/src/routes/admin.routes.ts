import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/auth';
import { Role } from '@medicalink/shared';
import { validate } from '../middlewares/validate';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { getWards, createWard, updateWard, deleteWard } from '../controllers/wardController';
import { getBeds, createBed, generateBeds, updateBed, deleteBed } from '../controllers/bedController';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roleController';
import { getDashboardStats } from '../controllers/dashboardController';

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createWardSchema,
  updateWardSchema,
  createBedSchema,
  updateBedSchema,
  generateBedsSchema,
  createUserSchema,
  updateUserSchema,
} from '../validators/adminValidator';

const router: Router = Router();

// Protect all admin routes
router.use(authenticate);
// Ensure only ADMIN or SUPER_ADMIN can access these routes
router.use(authorize([Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN]));
// Apply authenticated rate limiter
router.use(apiRateLimiter);

// Settings Routes
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

// Department Routes
router.route('/departments')
  .get(getDepartments)
  .post(validate(createDepartmentSchema), createDepartment);
router.route('/departments/:id')
  .put(validate(updateDepartmentSchema), updateDepartment)
  .delete(deleteDepartment);

// Ward Routes
router.route('/wards')
  .get(getWards)
  .post(validate(createWardSchema), createWard);
router.route('/wards/:id')
  .put(validate(updateWardSchema), updateWard)
  .delete(deleteWard);

// Bed Routes
router.route('/beds')
  .get(getBeds)
  .post(validate(createBedSchema), createBed);
router.route('/beds/bulk')
  .post(validate(generateBedsSchema), generateBeds);
router.route('/beds/:id')
  .put(validate(updateBedSchema), updateBed)
  .delete(deleteBed);

// User Routes
router.route('/users')
  .get(getUsers)
  .post(validate(createUserSchema), createUser);
router.route('/users/:id')
  .put(validate(updateUserSchema), updateUser)
  .delete(deleteUser);

// Dashboard Routes
router.route('/dashboard/stats')
  .get(getDashboardStats);

// Role Routes
router.route('/roles')
  .get(getRoles)
  .post(createRole);
router.route('/roles/:id')
  .put(updateRole)
  .delete(deleteRole);

export default router;
