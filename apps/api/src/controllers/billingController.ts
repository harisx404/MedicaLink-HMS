import { Request, Response, NextFunction, RequestHandler } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { getBillModel, IBillDocument } from '../models/Bill';
import { getCreditNoteModel } from '../models/CreditNote';
import {
  calculateBillTotals,
  autoFetchPendingCharges,
  generateBillNumber,
  generateCreditNoteNumber,
  recalculatePaymentTotals,
} from '../services/billingService';
import { BillStatus, CreditNoteStatus } from '@medicalink/shared';
import mongoose from 'mongoose';

// Helper: extract the authenticated user's tenantId and userId safely.
// All billing routes are protected by `authenticate`, so req.user is guaranteed.
const getAuthUser = (req: Request) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  return { tenantId: req.user.tenantId, userId: req.user.userId };
};

export const createBill: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId, userId } = getAuthUser(req);
  const { patient, encounter, billType, items, insuranceClaim } = req.body;

  const Bill = getBillModel(req.tenantDb!);
  const totals = calculateBillTotals(items || []);

  const bill = new Bill({
    tenantId,
    billNumber: generateBillNumber(),
    patient,
    encounter,
    billType,
    items: totals.items.map(item => ({
      ...item,
      refId: item.refId ? new mongoose.Types.ObjectId(item.refId) : undefined,
      performedBy: item.performedBy ? new mongoose.Types.ObjectId(item.performedBy) : undefined,
      serviceDate: item.serviceDate ? new Date(item.serviceDate) : undefined,
    })),
    grossAmount: totals.grossAmount,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    cgstAmount: totals.cgstAmount,
    sgstAmount: totals.sgstAmount,
    taxAmount: totals.taxAmount,
    roundOff: totals.roundOff,
    netAmount: totals.netAmount,
    insuranceClaim,
    status: BillStatus.DRAFT,
    createdBy: userId,
    updatedBy: userId,
  });

  await bill.save();
  await bill.populate('patient', 'firstName lastName uhid');

  return sendSuccess(res, 'Bill created successfully', bill, 201);
});

export const getPendingCharges: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const { patientId, consultationId } = req.query;

  if (!patientId) throw new AppError('patientId is required', 400);

  const pendingItems = await autoFetchPendingCharges(
    req.tenantDb!,
    tenantId,
    patientId as string,
    consultationId as string | undefined
  );

  return sendSuccess(res, 'Pending charges fetched successfully', pendingItems);
});

export const listBills: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const { patientId, status, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query: mongoose.FilterQuery<IBillDocument> = { tenantId };
  if (patientId) query.patient = patientId;
  if (status) query.status = status;
  if (startDate && endDate) {
    query.billDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    };
  }

  const Bill = getBillModel(req.tenantDb!);
  const skip = (Number(page) - 1) * Number(limit);

  const [bills, total] = await Promise.all([
    Bill.find(query)
      .populate('patient', 'firstName lastName uhid phone')
      .sort({ billDate: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Bill.countDocuments(query),
  ]);

  return sendPaginated(res, 'Bills fetched successfully', bills, total, Number(page), Number(limit));
});

export const getBillDetail: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const Bill = getBillModel(req.tenantDb!);

  const bill = await Bill.findOne({ _id: req.params.id, tenantId })
    .populate('patient', 'firstName lastName uhid email phone dateOfBirth gender')
    .populate('createdBy', 'firstName lastName')
    .populate('payments.receivedBy', 'firstName lastName');

  if (!bill) throw new AppError('Bill not found', 404);

  return sendSuccess(res, 'Bill details fetched', bill);
});

export const updateBill: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId, userId } = getAuthUser(req);
  const { items, insuranceClaim, discountReason } = req.body;
  const Bill = getBillModel(req.tenantDb!);

  const bill = await Bill.findOne({ _id: req.params.id, tenantId });
  if (!bill) throw new AppError('Bill not found', 404);
  if (bill.status !== BillStatus.DRAFT) throw new AppError('Only DRAFT bills can be modified', 400);

  if (items) {
    const totals = calculateBillTotals(items);
    bill.items = totals.items.map(item => ({
      ...item,
      refId: item.refId ? new mongoose.Types.ObjectId(item.refId) : undefined,
      performedBy: item.performedBy ? new mongoose.Types.ObjectId(item.performedBy) : undefined,
      serviceDate: item.serviceDate ? new Date(item.serviceDate) : undefined,
    })) as typeof bill.items;
    bill.grossAmount = totals.grossAmount;
    bill.discountAmount = totals.discountAmount;
    bill.taxableAmount = totals.taxableAmount;
    bill.cgstAmount = totals.cgstAmount;
    bill.sgstAmount = totals.sgstAmount;
    bill.taxAmount = totals.taxAmount;
    bill.roundOff = totals.roundOff;
    bill.netAmount = totals.netAmount;
  }

  if (insuranceClaim) bill.insuranceClaim = insuranceClaim;
  if (discountReason !== undefined) bill.discountReason = discountReason;
  bill.updatedBy = new mongoose.Types.ObjectId(userId);

  await bill.save();
  return sendSuccess(res, 'Bill updated successfully', bill);
});

export const finalizeBill: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const Bill = getBillModel(req.tenantDb!);

  const bill = await Bill.findOne({ _id: req.params.id, tenantId });
  if (!bill) throw new AppError('Bill not found', 404);
  if (bill.status !== BillStatus.DRAFT) throw new AppError('Bill is already finalized or voided', 400);

  bill.status = BillStatus.GENERATED;
  await bill.save();

  return sendSuccess(res, 'Bill finalized successfully', bill);
});

export const recordPayment: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId, userId } = getAuthUser(req);
  const { mode, amount, reference, date } = req.body;

  const Bill = getBillModel(req.tenantDb!);
  const bill = await Bill.findOne({ _id: req.params.id, tenantId });

  if (!bill) throw new AppError('Bill not found', 404);
  if (['DRAFT', 'VOID', 'REFUNDED'].includes(bill.status)) {
    throw new AppError(`Cannot record payment for bill in ${bill.status} status`, 400);
  }

  bill.payments.push({
    mode,
    amount,
    reference,
    date: date ? new Date(date) : new Date(),
    receivedBy: new mongoose.Types.ObjectId(userId),
  });

  const { totalPaid, balance, newStatus } = recalculatePaymentTotals(bill);
  bill.totalPaid = totalPaid;
  bill.balance = balance;
  bill.status = newStatus as BillStatus;

  await bill.save();
  return sendSuccess(res, 'Payment recorded successfully', bill);
});

export const voidBill: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const { voidReason } = req.body;

  if (!voidReason) throw new AppError('Void reason is required', 400);

  const Bill = getBillModel(req.tenantDb!);
  const bill = await Bill.findOne({ _id: req.params.id, tenantId });

  if (!bill) throw new AppError('Bill not found', 404);
  if (bill.status === BillStatus.PAID) {
    throw new AppError('Cannot void a fully paid bill. Issue a refund/credit note instead.', 400);
  }

  bill.status = BillStatus.VOID;
  bill.voidReason = voidReason;
  await bill.save();

  return sendSuccess(res, 'Bill voided successfully', bill);
});

export const issueCreditNote: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId, userId } = getAuthUser(req);
  const { amount, reason } = req.body;

  const Bill = getBillModel(req.tenantDb!);
  const CreditNote = getCreditNoteModel(req.tenantDb!);

  const bill = await Bill.findOne({ _id: req.params.id, tenantId });
  if (!bill) throw new AppError('Bill not found', 404);
  if (!amount || !reason) throw new AppError('Amount and reason are required', 400);
  if (amount > bill.totalPaid) throw new AppError('Refund amount cannot exceed total paid', 400);

  const creditNote = new CreditNote({
    tenantId,
    creditNoteNumber: generateCreditNoteNumber(),
    originalBill: bill._id,
    patient: bill.patient,
    amount,
    reason,
    issuedBy: userId,
    status: CreditNoteStatus.REFUNDED,
  });

  await creditNote.save();

  bill.creditNoteRef = creditNote._id as mongoose.Types.ObjectId;
  bill.status = BillStatus.REFUNDED;
  await bill.save();

  return sendSuccess(res, 'Credit note issued and bill refunded', creditNote, 201);
});

export const downloadBillPdf: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = getAuthUser(req);
  const Bill = getBillModel(req.tenantDb!);

  const bill = await Bill.findOne({ _id: req.params.id, tenantId })
    .populate('patient', 'firstName lastName uhid address phone email')
    .populate('createdBy', 'firstName lastName');

  if (!bill) throw new AppError('Bill not found', 404);

  // PDF generation is handled client-side via window.print() in this phase.
  // Phase 18 will integrate server-side PDFKit generation.
  return sendError(res, 'PDF generation is configured for client-side (window.print) in this phase', 501);
});
