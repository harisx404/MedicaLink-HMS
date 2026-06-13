import { Request, Response } from 'express';
import { getDispensingModel } from '../models/Dispensing';
import { getDrugModel } from '../models/Drug';
import { getDrugBatchModel } from '../models/DrugBatch';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { DispensingStatus } from '@medicalink/shared';

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const Dispensing = getDispensingModel(req.tenantDb!);
    const { period = '30', startDate, endDate } = req.query;
    
    let queryStartDate = new Date();
    let queryEndDate = new Date();
    
    if (startDate && endDate) {
      queryStartDate = new Date(startDate as string);
      queryEndDate = new Date(endDate as string);
    } else {
      queryStartDate.setDate(queryStartDate.getDate() - parseInt(period as string));
    }
    
    const salesData = await Dispensing.aggregate([
      {
        $match: {
          dispensedAt: { $gte: queryStartDate, $lte: queryEndDate },
          status: { $in: [DispensingStatus.COMPLETED, DispensingStatus.PARTIAL] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dispensedAt" } },
          totalSales: { $sum: "$totalAmount" },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return sendSuccess(res, 'Sales report retrieved successfully', salesData);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch sales report', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getInventoryValuationReport = async (req: Request, res: Response) => {
  try {
    const Drug = getDrugModel(req.tenantDb!);
    
    const valuationData = await Drug.aggregate([
      { $match: { tenantId: req.user?.tenantId, isActive: true } },
      {
        $project: {
          name: 1,
          category: 1,
          currentStock: 1,
          purchaseRate: 1,
          mrp: 1,
          stockValueAtCost: { $multiply: ["$currentStock", "$purchaseRate"] },
          stockValueAtMRP: { $multiply: ["$currentStock", "$mrp"] }
        }
      },
      { $sort: { stockValueAtCost: -1 } }
    ]);
    
    const summary = valuationData.reduce((acc, curr) => {
      acc.totalCostValue += curr.stockValueAtCost || 0;
      acc.totalMRPValue += curr.stockValueAtMRP || 0;
      return acc;
    }, { totalCostValue: 0, totalMRPValue: 0 });
    
    return sendSuccess(res, 'Inventory valuation report retrieved successfully', { items: valuationData, summary });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch inventory valuation report', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getExpiryReport = async (req: Request, res: Response) => {
  try {
    const DrugBatch = getDrugBatchModel(req.tenantDb!);
    const { days = '90' } = req.query;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(days as string));
    
    const expiryData = await DrugBatch.find({
      remainingQuantity: { $gt: 0 },
      expiryDate: { $lte: targetDate }
    })
    .populate('drug', 'name genericName category')
    .sort({ expiryDate: 1 });
    
    return sendSuccess(res, 'Expiry report retrieved successfully', expiryData);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch expiry report', 500, [{ field: 'server', message: error.message }]);
  }
};
