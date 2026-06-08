import { Request, Response, RequestHandler } from 'express';
import Department from '../models/Department';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * @desc    Get all departments
 * @route   GET /api/v1/admin/departments
 * @access  Private (Admin/SuperAdmin)
 */
export const getDepartments: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const DepartmentModel = db.model('Department', Department.schema);
  const departments = await DepartmentModel.find({ tenantId }).populate('headDoctor', 'firstName lastName email role').sort({ name: 1 });

  sendSuccess(res, 'Departments retrieved successfully', departments);
});

/**
 * @desc    Create a new department
 * @route   POST /api/v1/admin/departments
 * @access  Private (Admin/SuperAdmin)
 */
export const createDepartment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const DepartmentModel = db.model('Department', Department.schema);

  const existingDept = await DepartmentModel.findOne({ tenantId, code: req.body.code.toUpperCase() });
  if (existingDept) {
    return sendError(res, 'A department with this code already exists', 400);
  }

  const newDepartment = await DepartmentModel.create({
    ...req.body,
    tenantId,
    code: req.body.code.toUpperCase()
  });

  sendSuccess(res, 'Department created successfully', newDepartment, 201);
});

/**
 * @desc    Update a department
 * @route   PUT /api/v1/admin/departments/:id
 * @access  Private (Admin/SuperAdmin)
 */
export const updateDepartment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const DepartmentModel = db.model('Department', Department.schema);

  const department = await DepartmentModel.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('headDoctor', 'firstName lastName email role');

  if (!department) {
    return sendError(res, 'Department not found', 404);
  }

  sendSuccess(res, 'Department updated successfully', department);
});

/**
 * @desc    Delete a department
 * @route   DELETE /api/v1/admin/departments/:id
 * @access  Private (Admin/SuperAdmin)
 */
export const deleteDepartment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const DepartmentModel = db.model('Department', Department.schema);

  const department = await DepartmentModel.findOneAndDelete({ _id: id, tenantId });

  if (!department) {
    return sendError(res, 'Department not found', 404);
  }

  sendSuccess(res, 'Department deleted successfully');
});
