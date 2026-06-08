import { Request, Response, RequestHandler } from 'express';
import { getUserModel } from '../models/User';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Types } from 'mongoose';

/**
 * @desc    Get all staff users in a hospital
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
export const getUsers: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const User = getUserModel(db);
  const users = await User.find({ tenantId })
    .select('-password')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  sendSuccess(res, 'Staff retrieved successfully', users);
});

/**
 * @desc    Create a new staff user
 * @route   POST /api/v1/admin/users
 * @access  Private (Admin)
 */
export const createUser: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const User = getUserModel(db);
  const { 
    email, password, firstName, lastName, role, departmentId,
    phone, dob, gender, address, staffId, employeeId, designation,
    joinDate, specialization, registrationNumber, degree, experienceYears
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'Email already in use', 400);
  }

  const newUser = await User.create({
    tenantId,
    email,
    password, // Handled by pre-save hook in User model
    firstName,
    lastName,
    role,
    department: departmentId ? new Types.ObjectId(departmentId) : undefined,
    phone, dob, gender, address, staffId, employeeId, designation,
    joinDate, specialization, registrationNumber, degree, experienceYears,
    isActive: true,
  });

  const userObject = newUser.toObject();
  delete userObject.password;

  sendSuccess(res, 'Staff created successfully', userObject, 201);
});

/**
 * @desc    Update staff user
 * @route   PUT /api/v1/admin/users/:id
 * @access  Private (Admin)
 */
export const updateUser: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const User = getUserModel(db);

  // Exclude password from direct updates via this route
  const updateData = { ...req.body };
  delete updateData.password;
  if ('departmentId' in updateData) {
    updateData.department = updateData.departmentId ? new Types.ObjectId(updateData.departmentId) : null;
    delete updateData.departmentId;
  }

  const user = await User.findOneAndUpdate(
    { _id: id, tenantId }, // Ensure they only update users in their tenant
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('department', 'name code').select('-password');

  if (!user) {
    return sendError(res, 'Staff member not found', 404);
  }

  sendSuccess(res, 'Staff updated successfully', user);
});

/**
 * @desc    Delete staff user (soft delete / deactivate)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const User = getUserModel(db);

  // Soft delete by setting isActive to false
  const user = await User.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!user) {
    return sendError(res, 'Staff member not found', 404);
  }

  sendSuccess(res, 'Staff member deactivated successfully');
});
