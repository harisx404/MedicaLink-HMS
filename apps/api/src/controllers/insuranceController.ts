import { Request, Response, NextFunction, RequestHandler } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { getBillModel, IBillDocument } from '../models/Bill';
import { getInsurancePanelModel } from '../models/InsurancePanel';
import { InsuranceClaimStatus } from '@medicalink/shared';
import mongoose from 'mongoose';

// All insurance routes are protected by `authenticate`, so req.user is guaranteed.
const getAuthUser = (req: Request) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  return { tenantId: req.user.tenantId };
};

export const listClaims: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const { status, page = 1, limit = 20 } = req.query;

  const Bill = getBillModel(req.tenantDb!);

  const query: mongoose.FilterQuery<IBillDocument> = {
    tenantId,
    'insuranceClaim.insuranceId': { $exists: true },
  };

  if (status) query['insuranceClaim.status'] = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [billsWithClaims, total] = await Promise.all([
    Bill.find(query)
      .populate('patient', 'firstName lastName uhid')
      .select('billNumber billDate netAmount insuranceClaim patient status')
      .sort({ 'insuranceClaim.claimDate': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Bill.countDocuments(query),
  ]);

  return sendPaginated(
    res, 'Insurance claims fetched', billsWithClaims, total, Number(page), Number(limit)
  );
});

export const submitClaim: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const { claimNumber, claimedAmount } = req.body;

  const Bill = getBillModel(req.tenantDb!);
  const bill = await Bill.findOne({ _id: req.params.id, tenantId });

  if (!bill || !bill.insuranceClaim) throw new AppError('Bill or Insurance Claim not found', 404);

  bill.insuranceClaim.status = InsuranceClaimStatus.SUBMITTED;
  bill.insuranceClaim.claimNumber = claimNumber || `CLM-${Date.now()}`;
  bill.insuranceClaim.claimDate = new Date();
  if (claimedAmount) bill.insuranceClaim.claimedAmount = claimedAmount;

  await bill.save();
  return sendSuccess(res, 'Claim submitted successfully', bill.insuranceClaim);
});

export const updateClaimStatus: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const { status, approvedAmount, settledAmount, rejectionReason } = req.body;

  const Bill = getBillModel(req.tenantDb!);
  const bill = await Bill.findOne({ _id: req.params.id, tenantId });

  if (!bill || !bill.insuranceClaim) throw new AppError('Bill or Insurance Claim not found', 404);

  bill.insuranceClaim.status = status as InsuranceClaimStatus;
  if (approvedAmount !== undefined) bill.insuranceClaim.approvedAmount = approvedAmount;
  if (settledAmount !== undefined) bill.insuranceClaim.settledAmount = settledAmount;
  if (rejectionReason !== undefined) bill.insuranceClaim.rejectionReason = rejectionReason;

  await bill.save();
  return sendSuccess(res, 'Claim status updated successfully', bill.insuranceClaim);
});

// --- Insurance Panels ---

export const listInsurancePanels: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const InsurancePanel = getInsurancePanelModel(req.tenantDb!);

  const panels = await InsurancePanel.find({ tenantId, isActive: true }).sort({ name: 1 });
  return sendSuccess(res, 'Insurance panels fetched successfully', panels);
});

export const addInsurancePanel: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const InsurancePanel = getInsurancePanelModel(req.tenantDb!);

  const panel = new InsurancePanel({ ...req.body, tenantId });
  await panel.save();
  return sendSuccess(res, 'Insurance panel created successfully', panel, 201);
});
