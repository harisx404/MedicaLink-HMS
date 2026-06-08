import { Request, Response, RequestHandler } from 'express';
import Ward from '../models/Ward';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * @desc    Get all wards
 * @route   GET /api/v1/admin/wards
 * @access  Private (Admin/SuperAdmin)
 */
export const getWards: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const WardModel = db.model('Ward', Ward.schema);
  const wards = await WardModel.find({ tenantId }).populate('departmentId', 'name code').sort({ name: 1 });

  sendSuccess(res, 'Wards retrieved successfully', wards);
});

/**
 * @desc    Create a new ward
 * @route   POST /api/v1/admin/wards
 * @access  Private (Admin/SuperAdmin)
 */
export const createWard: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const WardModel = db.model('Ward', Ward.schema);

  const existingWard = await WardModel.findOne({ tenantId, code: req.body.code.toUpperCase() });
  if (existingWard) {
    return sendError(res, 'A ward with this code already exists', 400);
  }

  const newWard = await WardModel.create({
    ...req.body,
    tenantId,
    code: req.body.code.toUpperCase()
  });

  sendSuccess(res, 'Ward created successfully', newWard, 201);
});

/**
 * @desc    Update a ward
 * @route   PUT /api/v1/admin/wards/:id
 * @access  Private (Admin/SuperAdmin)
 */
export const updateWard: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const WardModel = db.model('Ward', Ward.schema);

  const ward = await WardModel.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('departmentId', 'name code');

  if (!ward) {
    return sendError(res, 'Ward not found', 404);
  }

  sendSuccess(res, 'Ward updated successfully', ward);
});

/**
 * @desc    Delete a ward
 * @route   DELETE /api/v1/admin/wards/:id
 * @access  Private (Admin/SuperAdmin)
 */
export const deleteWard: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const WardModel = db.model('Ward', Ward.schema);

  const ward = await WardModel.findOneAndDelete({ _id: id, tenantId });

  if (!ward) {
    return sendError(res, 'Ward not found', 404);
  }

  // NOTE: In a real production app, we would also check if beds are occupied before deleting.
  // For Phase 3, we allow deletion for simplicity, or we can add a check if needed.

  sendSuccess(res, 'Ward deleted successfully');
});
