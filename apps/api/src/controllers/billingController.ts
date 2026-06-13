import { Request, Response } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getBillModel } from '../models/Bill';
import { getCreditNoteModel } from '../models/CreditNote';
import { 
  calculateBillTotals, 
  autoFetchPendingCharges, 
  generateBillNumber, 
  generateCreditNoteNumber,
  recalculatePaymentTotals 
} from '../services/billingService';
import { BillStatus, CreditNoteStatus } from '@medicalink/shared';

export const createBill = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const userId = (req.user as any).userId || (req.user as any).id;
    const { patient, encounter, billType, items, insuranceClaim } = req.body;

    const Bill = getBillModel(req.tenantDb!);

    // Calculate totals
    const totals = calculateBillTotals(items || []);

    const bill = new Bill({
      tenantId,
      billNumber: generateBillNumber(),
      patient,
      encounter,
      billType,
      items: totals.items,
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
      updatedBy: userId
    });

    await bill.save();
    
    // Populate patient for response
    await bill.populate('patient', 'firstName lastName uhid');

    return sendSuccess(res, 'Bill created successfully', bill, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getPendingCharges = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { patientId, consultationId } = req.query;

    if (!patientId) {
      return sendError(res, 'patientId is required', 400);
    }

    const pendingItems = await autoFetchPendingCharges(
      req.tenantDb!,
      tenantId,
      patientId as string,
      consultationId as string | undefined
    );

    return sendSuccess(res, 'Pending charges fetched successfully', pendingItems);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const listBills = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { patientId, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query: any = { tenantId };
    if (patientId) query.patient = patientId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.billDate = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    const Bill = getBillModel(req.tenantDb!);
    const skip = (Number(page) - 1) * Number(limit);

    const bills = await Bill.find(query)
      .populate('patient', 'firstName lastName uhid phone')
      .sort({ billDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Bill.countDocuments(query);

    return sendPaginated(res, 'Bills fetched successfully', bills, total, Number(page), Number(limit));
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getBillDetail = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const Bill = getBillModel(req.tenantDb!);

    const bill = await Bill.findOne({ _id: req.params.id, tenantId })
      .populate('patient', 'firstName lastName uhid email phone dateOfBirth gender')
      .populate('createdBy', 'firstName lastName')
      .populate('payments.receivedBy', 'firstName lastName');

    if (!bill) {
      return sendError(res, 'Bill not found', 404);
    }

    return sendSuccess(res, 'Bill details fetched', bill);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const updateBill = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const userId = (req.user as any).userId || (req.user as any).id;
    const { items, insuranceClaim, discountReason } = req.body;
    const Bill = getBillModel(req.tenantDb!);

    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    if (!bill) return sendError(res, 'Bill not found', 404);

    if (bill.status !== BillStatus.DRAFT) {
      return sendError(res, 'Only DRAFT bills can be modified', 400);
    }

    // Recalculate if items provided
    if (items) {
      const totals = calculateBillTotals(items);
      bill.items = totals.items as any;
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
    
    bill.updatedBy = userId;

    await bill.save();
    return sendSuccess(res, 'Bill updated successfully', bill);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const finalizeBill = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const Bill = getBillModel(req.tenantDb!);

    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    if (!bill) return sendError(res, 'Bill not found', 404);

    if (bill.status !== BillStatus.DRAFT) {
      return sendError(res, 'Bill is already finalized or voided', 400);
    }

    bill.status = BillStatus.GENERATED;
    await bill.save();

    return sendSuccess(res, 'Bill finalized successfully', bill);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const userId = (req.user as any).userId || (req.user as any).id;
    const { mode, amount, reference, date } = req.body;

    const Bill = getBillModel(req.tenantDb!);
    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    
    if (!bill) return sendError(res, 'Bill not found', 404);
    if (['DRAFT', 'VOID', 'REFUNDED'].includes(bill.status)) {
      return sendError(res, `Cannot record payment for bill in ${bill.status} status`, 400);
    }

    bill.payments.push({
      mode,
      amount,
      reference,
      date: date ? new Date(date) : new Date(),
      receivedBy: userId
    });

    const { totalPaid, balance, newStatus } = recalculatePaymentTotals(bill);
    bill.totalPaid = totalPaid;
    bill.balance = balance;
    bill.status = newStatus as BillStatus;

    await bill.save();
    return sendSuccess(res, 'Payment recorded successfully', bill);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const voidBill = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { voidReason } = req.body;
    
    if (!voidReason) return sendError(res, 'Void reason is required', 400);

    const Bill = getBillModel(req.tenantDb!);
    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    
    if (!bill) return sendError(res, 'Bill not found', 404);
    if (bill.status === BillStatus.PAID) {
      return sendError(res, 'Cannot void a fully paid bill. Issue a refund/credit note instead.', 400);
    }

    bill.status = BillStatus.VOID;
    bill.voidReason = voidReason;
    await bill.save();

    return sendSuccess(res, 'Bill voided successfully', bill);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const issueCreditNote = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const userId = (req.user as any).userId || (req.user as any).id;
    const { amount, reason } = req.body;

    const Bill = getBillModel(req.tenantDb!);
    const CreditNote = getCreditNoteModel(req.tenantDb!);

    const bill = await Bill.findOne({ _id: req.params.id, tenantId });
    if (!bill) return sendError(res, 'Bill not found', 404);

    if (!amount || !reason) return sendError(res, 'Amount and reason are required', 400);
    if (amount > bill.totalPaid) return sendError(res, 'Refund amount cannot exceed total paid', 400);

    const creditNote = new CreditNote({
      tenantId,
      creditNoteNumber: generateCreditNoteNumber(),
      originalBill: bill._id,
      patient: bill.patient,
      amount,
      reason,
      issuedBy: userId,
      status: CreditNoteStatus.REFUNDED
    });

    await creditNote.save();

    // Link and update bill status
    bill.creditNoteRef = creditNote._id as any;
    bill.status = BillStatus.REFUNDED;
    await bill.save();

    return sendSuccess(res, 'Credit note issued and bill refunded', creditNote, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const downloadBillPdf = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const Bill = getBillModel(req.tenantDb!);

    const bill = await Bill.findOne({ _id: req.params.id, tenantId })
      .populate('patient', 'firstName lastName uhid address phone email')
      .populate('createdBy', 'firstName lastName');

    if (!bill) return sendError(res, 'Bill not found', 404);

    // In a real implementation with PDFKit, we would call:
    // const pdfBuffer = await generateBillPdf(bill, hospitalSettings);
    // res.set('Content-Type', 'application/pdf');
    // res.set('Content-Disposition', `attachment; filename=Invoice-${bill.billNumber}.pdf`);
    // return res.send(pdfBuffer);
    
    // For this blueprint implementation without full PDFKit setup:
    return sendError(res, 'PDF generation is configured for client-side (window.print) in this phase', 501);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
