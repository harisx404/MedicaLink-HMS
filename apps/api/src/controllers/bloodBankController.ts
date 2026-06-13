import { Request, Response, RequestHandler } from 'express';
import { getDonorModel, getBloodUnitModel, getBloodRequestModel } from '../models/BloodBank';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { BloodUnitStatus, BloodRequestStatus } from '@medicalink/shared';

// DONORS
export const registerDonor: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const Donor = getDonorModel(tenantDb);
  const donor = await Donor.create({ ...req.body, tenantId });
  
  sendSuccess(res, 'Donor registered', donor, 201);
});

export const getDonors: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const Donor = getDonorModel(tenantDb);
  const donors = await Donor.find({ tenantId }).sort({ createdAt: -1 });
  
  sendSuccess(res, 'Donors fetched', donors);
});

// INVENTORY
export const addBloodUnit: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const BloodUnit = getBloodUnitModel(tenantDb);
  const unit = await BloodUnit.create({ ...req.body, tenantId });
  
  sendSuccess(res, 'Blood unit added', unit, 201);
});

export const getInventory: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const BloodUnit = getBloodUnitModel(tenantDb);
  const units = await BloodUnit.find({ tenantId })
    .populate('collectedFrom')
    .sort({ expiryDate: 1 });
  
  sendSuccess(res, 'Inventory fetched', units);
});

export const updateTestResults: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const { tests } = req.body;
  
  const BloodUnit = getBloodUnitModel(tenantDb);
  const unit = await BloodUnit.findOne({ _id: id, tenantId });
  if (!unit) throw new AppError('Unit not found', 404);
  
  unit.tests = { ...unit.tests, ...tests, testedAt: new Date(), testedBy: req.user?.userId };
  
  // If any test is POSITIVE, automatically discard
  const testVals = Object.values(unit.tests) as string[];
  if (testVals.includes('POSITIVE')) {
    unit.status = BloodUnitStatus.DISCARDED;
  }
  
  await unit.save();
  sendSuccess(res, 'Test results updated', unit);
});

export const getInventoryStats: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const BloodUnit = getBloodUnitModel(tenantDb);
  const stats = await BloodUnit.aggregate([
    { $match: { tenantId, status: BloodUnitStatus.AVAILABLE } },
    { $group: { _id: { group: "$bloodGroup", type: "$componentType" }, count: { $sum: 1 } } }
  ]);
  
  sendSuccess(res, 'Inventory stats fetched', stats);
});

// REQUESTS
export const createBloodRequest: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const BloodRequest = getBloodRequestModel(tenantDb);
  const request = await BloodRequest.create({ ...req.body, tenantId, doctor: req.user?.userId });
  
  sendSuccess(res, 'Blood request created', request, 201);
});

export const getBloodRequests: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const BloodRequest = getBloodRequestModel(tenantDb);
  const requests = await BloodRequest.find({ tenantId })
    .populate('patient')
    .populate('doctor')
    .sort({ urgency: -1, createdAt: -1 });
  
  sendSuccess(res, 'Blood requests fetched', requests);
});

export const crossMatchUnit: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { requestId, unitId } = req.body;
  
  const BloodUnit = getBloodUnitModel(tenantDb);
  const BloodRequest = getBloodRequestModel(tenantDb);
  
  const unit = await BloodUnit.findOneAndUpdate(
    { _id: unitId, tenantId, status: BloodUnitStatus.AVAILABLE },
    { crossmatchDone: true, crossmatchBy: req.user?.userId, status: BloodUnitStatus.RESERVED },
    { new: true }
  );
  if (!unit) throw new AppError('Unit not available', 400);
  
  const request = await BloodRequest.findOneAndUpdate(
    { _id: requestId, tenantId },
    { status: BloodRequestStatus.CROSS_MATCHING },
    { new: true }
  );
  
  sendSuccess(res, 'Unit cross-matched and reserved', { unit, request });
});

export const issueUnit: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { requestId, unitId } = req.body;
  
  const BloodUnit = getBloodUnitModel(tenantDb);
  const BloodRequest = getBloodRequestModel(tenantDb);
  
  const request = await BloodRequest.findOne({ _id: requestId, tenantId });
  if (!request) throw new AppError('Request not found', 404);
  
  const unit = await BloodUnit.findOneAndUpdate(
    { _id: unitId, tenantId },
    { 
      status: BloodUnitStatus.ISSUED, 
      issuedTo: request.patient, 
      issuedFor: request.procedure,
      issuedAt: new Date()
    },
    { new: true }
  );
  
  request.status = BloodRequestStatus.ISSUED; // In a full logic we'd check if all requested units are issued
  await request.save();
  
  sendSuccess(res, 'Unit issued', { unit, request });
});
