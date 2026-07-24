import { Request, Response, RequestHandler } from 'express';
import Bed from '../models/Bed';
import Ward from '../models/Ward';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * @desc    Get all beds (optionally filter by wardId)
 * @route   GET /api/v1/admin/beds
 * @access  Private (Admin/SuperAdmin)
 */
export const getBeds: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { wardId } = req.query;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const BedModel = db.model('Bed', Bed.schema);
  const filter: any = { tenantId };
  if (wardId) filter.wardId = wardId;

  const beds = await BedModel.find(filter)
    .populate('wardId', 'name code type')
    .sort({ bedNumber: 1 });

  sendSuccess(res, 'Beds retrieved successfully', beds);
});

/**
 * @desc    Create a single bed
 * @route   POST /api/v1/admin/beds
 * @access  Private (Admin/SuperAdmin)
 */
export const createBed: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const BedModel = db.model('Bed', Bed.schema);
  const WardModel = db.model('Ward', Ward.schema);

  const { wardId, bedNumber, type, features } = req.body;

  // Verify ward exists and belongs to tenant
  const ward = await WardModel.findOne({ _id: wardId, tenantId });
  if (!ward) return sendError(res, 'Ward not found', 404);

  // Check if bed number exists in this ward
  const existingBed = await BedModel.findOne({ wardId, bedNumber: bedNumber.toUpperCase() });
  if (existingBed) {
    return sendError(res, 'Bed number already exists in this ward', 400);
  }

  const newBed = await BedModel.create({
    tenantId,
    wardId,
    bedNumber: bedNumber.toUpperCase(),
    type: type || 'STANDARD',
    status: 'AVAILABLE',
    features: features || []
  });

  sendSuccess(res, 'Bed created successfully', newBed, 201);
});

/**
 * @desc    Bulk generate beds for a ward
 * @route   POST /api/v1/admin/beds/bulk
 * @access  Private (Admin/SuperAdmin)
 */
export const generateBeds: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const BedModel = db.model('Bed', Bed.schema);
  const WardModel = db.model('Ward', Ward.schema);

  const { wardId, count, prefix = 'B', type = 'STANDARD', features = [] } = req.body;

  if (!count || count < 1) return sendError(res, 'Count must be at least 1', 400);

  const ward = await WardModel.findOne({ _id: wardId, tenantId });
  if (!ward) return sendError(res, 'Ward not found', 404);

  // Find highest existing bed number to continue sequence
  const existingBeds = await BedModel.find({ wardId });
  let nextNumber = 1;
  
  if (existingBeds.length > 0) {
    const maxNum = existingBeds.reduce((max: number, bed: any) => {
      const match = bed.bedNumber.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    nextNumber = maxNum + 1;
  }

  const bedsToCreate = [];
  for (let i = 0; i < count; i++) {
    const bedNumStr = String(nextNumber + i).padStart(3, '0');
    bedsToCreate.push({
      tenantId,
      wardId,
      bedNumber: `${prefix.toUpperCase()}${bedNumStr}`,
      type,
      status: 'AVAILABLE',
      features
    });
  }

  const createdBeds = await BedModel.insertMany(bedsToCreate);

  sendSuccess(res, `${count} beds generated successfully`, createdBeds, 201);
});

/**
 * @desc    Update a bed
 * @route   PUT /api/v1/admin/beds/:id
 * @access  Private (Admin/SuperAdmin)
 */
export const updateBed: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const BedModel = db.model('Bed', Bed.schema);

  const bed = await BedModel.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('wardId', 'name code');

  if (!bed) {
    return sendError(res, 'Bed not found', 404);
  }

  // NOTE: If status changed, we would emit Socket.io event here
  // req.app.get('io').to(tenantId.toString()).emit('bedStatusChanged', bed);

  sendSuccess(res, 'Bed updated successfully', bed);
});

/**
 * @desc    Delete a bed
 * @route   DELETE /api/v1/admin/beds/:id
 * @access  Private (Admin/SuperAdmin)
 */
export const deleteBed: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  const { id } = req.params;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const BedModel = db.model('Bed', Bed.schema);

  const bed = await BedModel.findOne({ _id: id, tenantId });
  if (!bed) {
    return sendError(res, 'Bed not found', 404);
  }

  if (bed.status === 'OCCUPIED') {
    return sendError(res, 'Cannot delete an occupied bed', 400);
  }

  await bed.deleteOne();

  sendSuccess(res, 'Bed deleted successfully');
});
