import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getBillModel } from '../models/Bill';
import { getServiceChargeModel } from '../models/ServiceCharge';

export const dailyCollection = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { date } = req.query;
    
    // Default to today if no date provided
    let startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    let endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    if (date) {
      const today = new Date(date as string);
      startOfDay = new Date(today.setHours(0, 0, 0, 0));
      endOfDay = new Date(today.setHours(23, 59, 59, 999));
    }
    const Bill = getBillModel(req.tenantDb!);
    
    // Find bills that had payments today
    const bills = await Bill.find({
      tenantId,
      'payments.date': { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['PARTIAL', 'PAID'] }
    }).populate('patient', 'firstName lastName');

    let totalCollection = 0;
    const byModeMap = new Map<string, { amount: number; count: number }>();

    const processedBills = bills.map(bill => {
      // Filter only payments for the target date
      const todayPayments = bill.payments.filter(p => 
        new Date(p.date) >= startOfDay && new Date(p.date) <= endOfDay
      );
      
      const billTodayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);
      totalCollection += billTodayTotal;

      todayPayments.forEach(p => {
        const current = byModeMap.get(p.mode) || { amount: 0, count: 0 };
        byModeMap.set(p.mode, { 
          amount: current.amount + p.amount, 
          count: current.count + 1 
        });
      });

      return {
        billNumber: bill.billNumber,
        patient: bill.patient ? `${(bill.patient as any).firstName} ${(bill.patient as any).lastName}` : 'Unknown',
        amount: bill.netAmount,
        paidAmount: billTodayTotal,
        balance: bill.balance
      };
    }).filter(b => b.paidAmount > 0); // Only include if they actually paid today

    const byMode = Array.from(byModeMap.entries()).map(([mode, data]) => ({
      mode,
      amount: data.amount,
      count: data.count
    }));

    return sendSuccess(res, 'Daily collection fetched', {
      date: startOfDay.toISOString().split('T')[0]!,
      totalCollection,
      byMode,
      bills: processedBills
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const revenueAnalytics = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const Bill = getBillModel(req.tenantDb!);
    
    // Last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get all non-void bills from last 30 days
    const matchStage: any = {
      tenantId,
      billDate: { 
        $gte: new Date(startDate.toISOString()), 
        $lte: new Date(endDate.toISOString()) 
      },
      status: { $ne: 'VOID' }
    };
    const bills = await Bill.find(matchStage);

    // 1. Revenue trend (by day)
    const trendMap = new Map<string, number>();
    // Pre-fill 30 days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      trendMap.set(d.toISOString().split('T')[0]!, 0);
    }

    // 2. Revenue by department (simplified by item category for now)
    const categoryMap = new Map<string, number>();
    
    let totalRevenue = 0;

    bills.forEach(bill => {
      const dateKey = new Date(bill.billDate).toISOString().split('T')[0]!;
      
      // Add to daily trend
      if (trendMap.has(dateKey)) {
        trendMap.set(dateKey, trendMap.get(dateKey)! + bill.netAmount);
      }
      
      totalRevenue += bill.netAmount;

      // Add to category breakdown
      bill.items.forEach(item => {
        const cat = item.category;
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.total);
      });
    });

    const trend = Array.from(trendMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const byCategory = Array.from(categoryMap.entries())
      .map(([department, revenue]) => ({ department, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    return sendSuccess(res, 'Revenue analytics fetched', {
      totalRevenue,
      trend,
      byCategory
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const outstandingReport = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const Bill = getBillModel(req.tenantDb!);
    
    const bills = await Bill.find({
      tenantId,
      status: { $in: ['GENERATED', 'PARTIAL'] },
      balance: { $gt: 0 }
    }).populate('patient', 'firstName lastName uhid');

    const today = new Date();
    
    const outstanding = bills.map(bill => {
      const billDate = new Date(bill.billDate);
      const diffTime = Math.abs(today.getTime() - billDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let agingBucket = '0-30';
      if (diffDays > 90) agingBucket = '90+';
      else if (diffDays > 60) agingBucket = '61-90';
      else if (diffDays > 30) agingBucket = '31-60';

      const p = bill.patient as any;
      return {
        patient: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
        uhid: p ? p.uhid : 'N/A',
        billNumber: bill.billNumber,
        billDate: bill.billDate,
        netAmount: bill.netAmount,
        totalPaid: bill.totalPaid,
        balance: bill.balance,
        daysSinceBill: diffDays,
        agingBucket
      };
    }).sort((a, b) => b.balance - a.balance);

    return sendSuccess(res, 'Outstanding report fetched', outstanding);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const insuranceReport = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const Bill = getBillModel(req.tenantDb!);
    
    const bills = await Bill.find({
      tenantId,
      'insuranceClaim.insuranceId': { $exists: true }
    });

    let totalClaimed = 0;
    let totalApproved = 0;
    let totalSettled = 0;

    bills.forEach(b => {
      const claim = b.insuranceClaim;
      if (claim) {
        totalClaimed += claim.claimedAmount || 0;
        totalApproved += claim.approvedAmount || 0;
        totalSettled += claim.settledAmount || 0;
      }
    });

    return sendSuccess(res, 'Insurance report fetched', {
      totalClaimed,
      totalApproved,
      totalSettled,
      count: bills.length
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

// --- Service Charges Master ---

export const serviceChargeList = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const { category, search } = req.query;

    const query: any = { tenantId, isActive: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search as string };

    const ServiceCharge = getServiceChargeModel(req.tenantDb!);
    
    const services = await ServiceCharge.find(query).sort({ name: 1 });
    return sendSuccess(res, 'Service charges fetched', services);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const createServiceCharge = async (req: Request, res: Response) => {
  try {
    const tenantId = (req.user as any).tenantId;
    const ServiceCharge = getServiceChargeModel(req.tenantDb!);
    
    // Upsert by code
    const service = await ServiceCharge.findOneAndUpdate(
      { tenantId, code: req.body.code },
      { ...req.body, tenantId },
      { new: true, upsert: true }
    );
    
    return sendSuccess(res, 'Service charge saved successfully', service, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
