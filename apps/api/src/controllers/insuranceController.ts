import { Request, Response } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getBillModel } from '../models/Bill';
import { getInsurancePanelModel } from '../models/InsurancePanel';

export const listClaims = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { status, page = 1, limit = 20 } = req.query;

    const Bill = getBillModel(req.tenantDb!);
    
    // Find bills that have an insurance claim
    const query: any = { 
      tenantId,
      'insuranceClaim.insuranceId': { $exists: true }
    };
    
    if (status) {
      query['insuranceClaim.status'] = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const billsWithClaims = await Bill.find(query)
      .populate('patient', 'firstName lastName uhid')
      .select('billNumber billDate netAmount insuranceClaim patient status')
      .sort({ 'insuranceClaim.claimDate': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Bill.countDocuments(query);

    return sendPaginated(res, 'Insurance claims fetched', billsWithClaims, total, Number(page), Number(limit));
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const submitClaim = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { claimNumber, claimedAmount } = req.body;
    
    const Bill = getBillModel(req.tenantDb!);
    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    
    if (!bill || !bill.insuranceClaim) {
      return sendError(res, 'Bill or Insurance Claim not found', 404);
    }

    bill.insuranceClaim.status = 'SUBMITTED' as any;
    bill.insuranceClaim.claimNumber = claimNumber || `CLM-${Date.now()}`;
    bill.insuranceClaim.claimDate = new Date();
    if (claimedAmount) bill.insuranceClaim.claimedAmount = claimedAmount;

    await bill.save();
    return sendSuccess(res, 'Claim submitted successfully', bill.insuranceClaim);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { status, approvedAmount, settledAmount, rejectionReason } = req.body;
    
    const Bill = getBillModel(req.tenantDb!);
    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    
    if (!bill || !bill.insuranceClaim) {
      return sendError(res, 'Bill or Insurance Claim not found', 404);
    }

    bill.insuranceClaim.status = status;
    
    if (approvedAmount !== undefined) bill.insuranceClaim.approvedAmount = approvedAmount;
    if (settledAmount !== undefined) bill.insuranceClaim.settledAmount = settledAmount;
    if (rejectionReason !== undefined) bill.insuranceClaim.rejectionReason = rejectionReason;

    await bill.save();
    return sendSuccess(res, 'Claim status updated successfully', bill.insuranceClaim);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

// --- Insurance Panels ---

export const listInsurancePanels = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const InsurancePanel = getInsurancePanelModel(req.tenantDb!);
    
    const panels = await InsurancePanel.find({ tenantId, isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 'Insurance panels fetched successfully', panels);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const createInsurancePanel = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const InsurancePanel = getInsurancePanelModel(req.tenantDb!);
    
    const panel = new InsurancePanel({
      ...req.body,
      tenantId
    });
    
    await panel.save();
    return sendSuccess(res, 'Insurance panel created successfully', panel, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
