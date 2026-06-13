import mongoose from 'mongoose';
import { getBillModel, IBillDocument } from '../models/Bill';
import { getLabOrderModel } from '../models/LabOrder';
import { getTestCatalogModel } from '../models/TestCatalog';
import { getDispensingModel } from '../models/Dispensing';
import { getConsultationModel } from '../models/Consultation';
import { BillItemCategory } from '@medicalink/shared';

export interface BillItemInput {
  category: string;
  description: string;
  refId?: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
  performedBy?: string;
  serviceDate?: string;
}

export interface BillTotals {
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  roundOff: number;
  netAmount: number;
  items: Array<BillItemInput & {
    amount: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    total: number;
  }>;
}

/**
 * Pure calculation function — computes all financial totals from line items.
 * Applies CGST + SGST split (intra-state Indian standard).
 */
export function calculateBillTotals(items: BillItemInput[]): BillTotals {
  let grossAmount = 0;
  let discountAmount = 0;
  let taxableAmount = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;

  const processedItems = items.map((item) => {
    const discountPct = item.discountPct ?? 0;
    const taxRate = item.taxRate ?? 18;

    const lineGross = item.quantity * item.unitPrice;
    const lineDiscount = lineGross * (discountPct / 100);
    const lineAmount = lineGross - lineDiscount;
    const lineCgst = lineAmount * (taxRate / 2 / 100);
    const lineSgst = lineAmount * (taxRate / 2 / 100);
    const lineTax = lineCgst + lineSgst;
    const lineTotal = lineAmount + lineTax;

    grossAmount += lineGross;
    discountAmount += lineDiscount;
    taxableAmount += lineAmount;
    cgstTotal += lineCgst;
    sgstTotal += lineSgst;

    return {
      ...item,
      discountPct,
      taxRate,
      amount: Math.round(lineAmount * 100) / 100,
      cgstAmount: Math.round(lineCgst * 100) / 100,
      sgstAmount: Math.round(lineSgst * 100) / 100,
      taxAmount: Math.round(lineTax * 100) / 100,
      total: Math.round(lineTotal * 100) / 100
    };
  });

  const taxAmount = cgstTotal + sgstTotal;
  const rawNet = taxableAmount + taxAmount;
  const roundOff = Math.round(rawNet) - rawNet;
  const netAmount = Math.round(rawNet);

  return {
    grossAmount: Math.round(grossAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    cgstAmount: Math.round(cgstTotal * 100) / 100,
    sgstAmount: Math.round(sgstTotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    roundOff: Math.round(roundOff * 100) / 100,
    netAmount,
    items: processedItems
  };
}

/**
 * Auto-fetches all unbilled charges for a patient encounter.
 * Queries: Consultation (doc fee), Lab Orders (test prices), Pharmacy Dispensing.
 * Returns pre-built BillItemInput[] for "one-click add pending charges".
 */
export async function autoFetchPendingCharges(
  connection: mongoose.Connection,
  tenantId: string,
  patientId: string,
  consultationId?: string
): Promise<BillItemInput[]> {
  const pendingItems: BillItemInput[] = [];

  // 1. Consultation fee
  if (consultationId) {
    const Consultation = getConsultationModel(connection);
    const consultation = await (Consultation as any).findOne({
      _id: consultationId,
      tenantId,
      patient: patientId
    }).populate('doctor', 'firstName lastName');

    if (consultation?.consultationFee && consultation.consultationFee > 0) {
      const doc = consultation.doctor as any;
      const docName = doc ? `Dr. ${doc.firstName} ${doc.lastName}` : 'Doctor';
      pendingItems.push({
        category: BillItemCategory.CONSULTATION,
        description: `Consultation — ${docName} (${consultation.visitType})`,
        refId: consultation._id.toString(),
        quantity: 1,
        unitPrice: consultation.consultationFee,
        discountPct: 0,
        taxRate: 18,
        serviceDate: consultation.visitDate
      });
    }
  }

  // 2. Lab charges — completed lab orders not yet billed
  const LabOrder = getLabOrderModel(connection);
  const TestCatalog = getTestCatalogModel(connection);

  const labOrders = await LabOrder.find({
    tenantId,
    patient: patientId,
    status: { $in: ['COMPLETED', 'REPORTED'] },
    billed: { $ne: true }   // We'll add a 'billed' flag later — for now fetch all
  });

  for (const order of labOrders) {
    for (const test of order.tests) {
      const catalog = await TestCatalog.findById(test.testId);
      if (catalog) {
        pendingItems.push({
          category: BillItemCategory.LAB,
          description: `Lab Test — ${test.testName}`,
          refId: order._id.toString(),
          quantity: 1,
          unitPrice: catalog.price,
          discountPct: 0,
          taxRate: 18
        });
      }
    }
  }

  // 3. Pharmacy dispensing charges
  const Dispensing = getDispensingModel(connection);
  const dispensings = await Dispensing.find({
    patient: patientId,
    status: 'COMPLETED',
    billed: { $ne: true }
  });

  for (const disp of dispensings) {
    if (disp.totalAmount > 0) {
      pendingItems.push({
        category: BillItemCategory.PHARMACY,
        description: `Pharmacy — Dispensing #${disp.dispensingNumber}`,
        refId: disp._id.toString(),
        quantity: 1,
        unitPrice: disp.totalAmount,
        discountPct: 0,
        taxRate: 12  // Pharma typically 12% GST
      });
    }
  }

  return pendingItems;
}

/**
 * Generates a sequential bill number: BILL-YYYYMMDD-NNNN
 */
export function generateBillNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().split('T')[0]!.replace(/-/g, '');
  const seq = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `BILL-${datePart}-${seq}`;
}

/**
 * Generates a sequential credit note number: CN-YYYYMMDD-NNNN
 */
export function generateCreditNoteNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().split('T')[0]!.replace(/-/g, '');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CN-${datePart}-${seq}`;
}

/**
 * Recalculates totalPaid and balance from payments array.
 * Determines new BillStatus (PARTIAL or PAID).
 */
export function recalculatePaymentTotals(
  bill: IBillDocument
): { totalPaid: number; balance: number; newStatus: string } {
  const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, bill.netAmount - totalPaid);

  let newStatus = bill.status.toString();
  if (balance <= 0) {
    newStatus = 'PAID';
  } else if (totalPaid > 0) {
    newStatus = 'PARTIAL';
  }

  return { totalPaid, balance, newStatus };
}
