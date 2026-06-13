import { Request, Response } from 'express';
import { getDrugModel } from '../models/Drug';
import { getDrugBatchModel } from '../models/DrugBatch';
import { sendSuccess, sendError, sendCreated, sendPaginated } from '../utils/apiResponse';

export const listDrugs = async (req: Request, res: Response) => {
  try {
    // Note: req.tenantDb should be set by the tenant middleware
    const Drug = getDrugModel(req.tenantDb!);
    
    // Pagination & filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const search = req.query.search as string;
    
    const query: any = { tenantId: req.user?.tenantId };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { barcode: search }
      ];
    }
    
    const total = await Drug.countDocuments(query);
    const drugs = await Drug.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });
      
    return sendPaginated(res, 'Drugs retrieved successfully', drugs, total, page, limit);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch drugs', 500, [{ field: 'server', message: error.message }]);
  }
};

export const createDrug = async (req: Request, res: Response) => {
  try {
    const Drug = getDrugModel(req.tenantDb!);
    const drugData = { ...req.body, tenantId: req.user?.tenantId };
    
    const newDrug = new Drug(drugData);
    await newDrug.save();
    
    return sendCreated(res, 'Drug created successfully', newDrug);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'A drug with this name/barcode already exists in your formulary', 400);
    }
    return sendError(res, 'Failed to create drug', 500, [{ field: 'server', message: error.message }]);
  }
};

export const updateDrug = async (req: Request, res: Response) => {
  try {
    const Drug = getDrugModel(req.tenantDb!);
    const { id } = req.params;
    
    const updatedDrug = await Drug.findOneAndUpdate(
      { _id: id, tenantId: req.user?.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedDrug) {
      return sendError(res, 'Drug not found', 404);
    }
    
    return sendSuccess(res, 'Drug updated successfully', updatedDrug);
  } catch (error: any) {
    return sendError(res, 'Failed to update drug', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getDrugBatches = async (req: Request, res: Response) => {
  try {
    const DrugBatch = getDrugBatchModel(req.tenantDb!);
    const { id } = req.params;
    
    const batches = await DrugBatch.find({ drug: id })
      .populate('supplierId', 'name')
      .sort({ expiryDate: 1 });
      
    return sendSuccess(res, 'Batches retrieved successfully', batches);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch batches', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getLowStockDrugs = async (req: Request, res: Response) => {
  try {
    const Drug = getDrugModel(req.tenantDb!);
    
    // Using aggregation to compare currentStock with minimumStock
    const lowStockDrugs = await Drug.aggregate([
      { $match: { tenantId: req.user?.tenantId, isActive: true } },
      { $match: { $expr: { $lte: ['$currentStock', '$reorderLevel'] } } },
      { $sort: { currentStock: 1 } }
    ]);
    
    return sendSuccess(res, 'Low stock drugs retrieved', lowStockDrugs);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch low stock drugs', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getExpiringDrugs = async (req: Request, res: Response) => {
  try {
    const DrugBatch = getDrugBatchModel(req.tenantDb!);
    const days = parseInt(req.query.days as string) || 30;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    const expiringBatches = await DrugBatch.find({
      remainingQuantity: { $gt: 0 },
      expiryDate: { $lte: targetDate, $gte: new Date() } // Not already expired, but expiring soon
    })
    .populate('drug', 'name genericName')
    .sort({ expiryDate: 1 });
    
    return sendSuccess(res, 'Expiring batches retrieved', expiringBatches);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch expiring drugs', 500, [{ field: 'server', message: error.message }]);
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  try {
    const Drug = getDrugModel(req.tenantDb!);
    const DrugBatch = getDrugBatchModel(req.tenantDb!);
    const { id } = req.params;
    const { batchId, quantityDifference, reason } = req.body;
    
    // In a real production app, we would wrap this in a MongoDB transaction
    const batch = await DrugBatch.findById(batchId);
    if (!batch || batch.drug.toString() !== id) {
      return sendError(res, 'Batch not found or does not belong to this drug', 404);
    }
    
    // Prevent negative stock
    if (batch.remainingQuantity + quantityDifference < 0) {
      return sendError(res, 'Cannot reduce stock below zero', 400);
    }
    
    batch.remainingQuantity += quantityDifference;
    await batch.save();
    
    const drug = await Drug.findById(id);
    if (drug) {
      drug.currentStock += quantityDifference;
      await drug.save();
    }
    
    // We would also log this adjustment in an AuditLog collection here
    
    return sendSuccess(res, 'Stock adjusted successfully', { drug, batch });
  } catch (error: any) {
    return sendError(res, 'Failed to adjust stock', 500, [{ field: 'server', message: error.message }]);
  }
};
