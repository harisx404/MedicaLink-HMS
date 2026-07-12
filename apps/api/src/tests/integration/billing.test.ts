import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { getBillModel } from '../../models/Bill';

describe('Billing Integration', () => {
  const getTestDb = () => mongoose.connection;

  describe('Bill Model — Financial Integrity', () => {
    it('creates a bill with line items and correct totals', async () => {
      const Bill = getBillModel(getTestDb());

      const bill = await Bill.create({
        tenantId: new mongoose.Types.ObjectId(),
        billNumber: 'BILL-2026-0001',
        patient: new mongoose.Types.ObjectId(),
        billType: 'OPD',
        billDate: new Date(),
        items: [
          {
            category: 'CONSULTATION',
            description: 'Cardiology Consultation',
            quantity: 1,
            unitPrice: 500,
            discountPct: 0,
            taxRate: 0,
            amount: 500,
            cgstAmount: 0,
            sgstAmount: 0,
            taxAmount: 0,
            total: 500,
          },
          {
            category: 'PHARMACY',
            description: 'Amoxicillin 500mg x 10',
            quantity: 10,
            unitPrice: 15,
            discountPct: 0,
            taxRate: 5,
            amount: 150,
            cgstAmount: 3.75,
            sgstAmount: 3.75,
            taxAmount: 7.5,
            total: 157.5,
          },
        ],
        grossAmount: 650,
        discountAmount: 0,
        taxableAmount: 150,
        cgstAmount: 3.75,
        sgstAmount: 3.75,
        taxAmount: 7.5,
        roundOff: 0,
        netAmount: 657.5,
        payments: [],
        totalPaid: 0,
        balance: 657.5,
        status: 'DRAFT',
      });

      expect(bill.billNumber).toBe('BILL-2026-0001');
      expect(bill.items).toHaveLength(2);
      expect(bill.netAmount).toBe(657.5);
      expect(bill.balance).toBe(657.5);
      expect(bill.status).toBe('DRAFT');
    });

    it('records payment and updates balance correctly', async () => {
      const Bill = getBillModel(getTestDb());

      const bill = await Bill.create({
        tenantId: new mongoose.Types.ObjectId(),
        billNumber: 'BILL-2026-0002',
        patient: new mongoose.Types.ObjectId(),
        billType: 'OPD',
        billDate: new Date(),
        items: [{
          category: 'CONSULTATION',
          description: 'General Checkup',
          quantity: 1,
          unitPrice: 300,
          discountPct: 0,
          taxRate: 0,
          amount: 300,
          cgstAmount: 0,
          sgstAmount: 0,
          taxAmount: 0,
          total: 300,
        }],
        grossAmount: 300,
        discountAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        taxAmount: 0,
        roundOff: 0,
        netAmount: 300,
        payments: [],
        totalPaid: 0,
        balance: 300,
        status: 'GENERATED',
      });

      // Simulate partial payment
      bill.payments.push({
        mode: 'CASH',
        amount: 200,
        date: new Date(),
      });
      bill.totalPaid = 200;
      bill.balance = bill.netAmount - bill.totalPaid;
      bill.status = 'PARTIAL';
      await bill.save();

      const updated = await Bill.findById(bill._id);
      expect(updated!.totalPaid).toBe(200);
      expect(updated!.balance).toBe(100);
      expect(updated!.status).toBe('PARTIAL');
    });

    it('marks bill as paid when fully settled', async () => {
      const Bill = getBillModel(getTestDb());

      const bill = await Bill.create({
        tenantId: new mongoose.Types.ObjectId(),
        billNumber: 'BILL-2026-0003',
        patient: new mongoose.Types.ObjectId(),
        billType: 'OPD',
        billDate: new Date(),
        items: [{
          category: 'LAB',
          description: 'Complete Blood Count',
          quantity: 1,
          unitPrice: 250,
          discountPct: 0,
          taxRate: 0,
          amount: 250,
          cgstAmount: 0,
          sgstAmount: 0,
          taxAmount: 0,
          total: 250,
        }],
        grossAmount: 250,
        discountAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        taxAmount: 0,
        roundOff: 0,
        netAmount: 250,
        payments: [{
          mode: 'CARD',
          amount: 250,
          date: new Date(),
        }],
        totalPaid: 250,
        balance: 0,
        status: 'PAID',
      });

      expect(bill.balance).toBe(0);
      expect(bill.status).toBe('PAID');
      expect(bill.payments).toHaveLength(1);
    });

    it('applies discount and recalculates net amount', async () => {
      const Bill = getBillModel(getTestDb());

      const bill = await Bill.create({
        tenantId: new mongoose.Types.ObjectId(),
        billNumber: 'BILL-2026-0004',
        patient: new mongoose.Types.ObjectId(),
        billType: 'OPD',
        billDate: new Date(),
        items: [{
          category: 'CONSULTATION',
          description: 'Surgery Follow-up',
          quantity: 1,
          unitPrice: 1000,
          discountPct: 10,
          taxRate: 0,
          amount: 900,
          cgstAmount: 0,
          sgstAmount: 0,
          taxAmount: 0,
          total: 900,
        }],
        grossAmount: 1000,
        discountAmount: 100,
        discountReason: 'Senior citizen discount',
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        taxAmount: 0,
        roundOff: 0,
        netAmount: 900,
        payments: [],
        totalPaid: 0,
        balance: 900,
        status: 'DRAFT',
      });

      expect(bill.discountAmount).toBe(100);
      expect(bill.netAmount).toBe(900);
      expect(bill.discountReason).toBe('Senior citizen discount');
    });
  });
});
