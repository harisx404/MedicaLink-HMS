import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getDispensingModel } from '../models/Dispensing';
import { getDrugModel } from '../models/Drug';
import { getDrugBatchModel } from '../models/DrugBatch';
import { getPrescriptionModel } from '../models/Prescription';
import { calculateFEFOAllocation, deductStock, returnStock } from '../services/pharmacyService';
import { sendSuccess, sendError, sendCreated } from '../utils/apiResponse';
import { DispensingStatus } from '@medicalink/shared';

// Generate unique dispensing number
const generateDispensingNumber = (): string => {
  const prefix = 'DSP';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export const getPharmacyDashboard = async (req: Request, res: Response) => {
  try {
    const Dispensing = getDispensingModel(req.tenantDb!);
    const Drug = getDrugModel(req.tenantDb!);
    const DrugBatch = getDrugBatchModel(req.tenantDb!);
    const Prescription = getPrescriptionModel(req.tenantDb!);
    
    const tenantId = req.user?.tenantId as string;
    
    // 1. Pending Prescriptions
    const pendingPrescriptionsCount = await Prescription.countDocuments({
      tenantId,
      pharmacyStatus: 'PENDING'
    });
    
    // 2. Today's Dispensed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysDispensedCount = await Dispensing.countDocuments({
      dispensedAt: { $gte: today },
      status: { $in: [DispensingStatus.COMPLETED, DispensingStatus.PARTIAL] }
    });
    
    // 3. Low Stock Items (Detailed)
    const lowStockAlerts = await Drug.aggregate([
      { $match: { tenantId, isActive: true } },
      { $match: { $expr: { $lte: ['$currentStock', '$reorderLevel'] } } },
      { $project: { _id: 1, name: 1, currentStock: 1, reorderLevel: 1 } },
      { $limit: 10 }
    ]);
    
    // 4. Expiring This Month (Detailed)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const expiringAlerts = await DrugBatch.find({
      remainingQuantity: { $gt: 0 },
      expiryDate: { $lte: nextMonth, $gte: new Date() }
    })
    .populate('drug', 'name')
    .select('drug batchNumber expiryDate remainingQuantity')
    .limit(10);
    
    // 5. Daily Dispensing Trend (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dispensingTrend = await Dispensing.aggregate([
      { 
        $match: { 
          dispensedAt: { $gte: sevenDaysAgo },
          status: { $in: [DispensingStatus.COMPLETED, DispensingStatus.PARTIAL] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dispensedAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 6. Top 10 Dispensed Drugs This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topDispensedDrugs = await Dispensing.aggregate([
      { 
        $match: { 
          dispensedAt: { $gte: startOfMonth },
          status: { $in: [DispensingStatus.COMPLETED, DispensingStatus.PARTIAL] }
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.drug',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'drugs', // Ensure collection name matches Drug model
          localField: '_id',
          foreignField: '_id',
          as: 'drugDetails'
        }
      },
      { $unwind: '$drugDetails' },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          name: '$drugDetails.name'
        }
      }
    ]);
    
    return sendSuccess(res, 'Dashboard stats retrieved', {
      pendingPrescriptions: pendingPrescriptionsCount,
      todaysDispensed: todaysDispensedCount,
      lowStockItems: lowStockAlerts.length, // keep for backward compatibility
      expiringThisMonth: expiringAlerts.length, // keep for backward compatibility
      lowStockAlerts,
      expiringAlerts,
      dispensingTrend,
      topDispensedDrugs
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch dashboard stats', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getPrescriptionQueue = async (req: Request, res: Response) => {
  try {
    const Prescription = getPrescriptionModel(req.tenantDb!);
    
    const queue = await Prescription.find({
      tenantId: req.user?.tenantId,
      pharmacyStatus: { $in: ['PENDING', 'PARTIAL'] }
    })
    .populate('patient', 'firstName lastName uhid allergies')
    .populate('doctor', 'firstName lastName specializations')
    .sort({ createdAt: -1 });
    
    return sendSuccess(res, 'Prescription queue retrieved', queue);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch prescription queue', 500, [{ field: 'server', message: error.message }]);
  }
};

export const dispenseDrugs = async (req: Request, res: Response) => {
  // Using MongoDB transactions for atomic dispensing and stock updates
  const session = await req.tenantDb!.startSession();
  session.startTransaction();
  
  try {
    const Dispensing = getDispensingModel(req.tenantDb!);
    const Prescription = getPrescriptionModel(req.tenantDb!);
    const tenantId = req.user?.tenantId as string;
    
    const { prescriptionId, patientId, items, paidAmount } = req.body;
    
    // Prepare items array with FEFO batches
    const dispensingItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      // Find batches based on FEFO
      const allocations = await calculateFEFOAllocation(
        tenantId,
        item.drugId,
        item.quantity,
        req.tenantDb!
      );
      
      // Deduct stock for these allocations
      await deductStock(tenantId, item.drugId, allocations, session, req.tenantDb!);
      
      // Add each allocated batch as a separate line item in the dispensing record
      for (const alloc of allocations) {
        const itemTotal = alloc.quantityToDeduct * item.unitPrice;
        totalAmount += itemTotal;
        
        dispensingItems.push({
          drug: item.drugId,
          batch: alloc.batch._id,
          quantity: alloc.quantityToDeduct,
          dose: item.dose,
          unitPrice: item.unitPrice,
          totalPrice: itemTotal,
          instructions: item.instructions
        });
      }
    }
    
    // Create the dispensing record
    const dispensingRecord = new Dispensing({
      dispensingNumber: generateDispensingNumber(),
      prescription: prescriptionId,
      patient: patientId,
      dispensedBy: req.user?.userId,
      items: dispensingItems,
      totalAmount,
      paidAmount,
      status: DispensingStatus.COMPLETED
    });
    
    await dispensingRecord.save({ session });
    
    // Update prescription status
    if (prescriptionId) {
      await Prescription.findByIdAndUpdate(
        prescriptionId,
        { pharmacyStatus: 'DISPENSED' }, // Simplification: assuming full dispense here
        { session }
      );
    }
    
    await session.commitTransaction();
    session.endSession();
    
    // E.g., emit socket event to update dashboard queue
    req.app.get('io').to(`tenant-${tenantId}-pharmacy`).emit('drug-dispensed', { 
      prescriptionId, 
      dispensingId: dispensingRecord._id 
    });
    
    return sendCreated(res, 'Drugs dispensed successfully', dispensingRecord);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 'Failed to dispense drugs', 400, [{ field: 'server', message: error.message }]);
  }
};

export const getDispensingRecord = async (req: Request, res: Response) => {
  try {
    const Dispensing = getDispensingModel(req.tenantDb!);
    
    const record = await Dispensing.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid')
      .populate('dispensedBy', 'firstName lastName')
      .populate('items.drug', 'name genericName form strength')
      .populate('items.batch', 'batchNumber expiryDate');
      
    if (!record) {
      return sendError(res, 'Dispensing record not found', 404);
    }
    
    return sendSuccess(res, 'Dispensing record retrieved', record);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch dispensing record', 500, [{ field: 'server', message: error.message }]);
  }
};

export const processReturn = async (req: Request, res: Response) => {
  const session = await req.tenantDb!.startSession();
  session.startTransaction();
  
  try {
    const Dispensing = getDispensingModel(req.tenantDb!);
    const tenantId = req.user?.tenantId as string;
    const { dispensingId, returnItems } = req.body;
    
    const record = await Dispensing.findById(dispensingId);
    if (!record) {
      throw new Error('Dispensing record not found');
    }
    
    if (record.status === DispensingStatus.RETURNED) {
      throw new Error('This record has already been fully returned');
    }
    
    // Process returns
    for (const item of returnItems) {
      // Verify item exists in dispensing record and quantity is valid
      const recordItem = record.items.find(i => (i as any)._id?.toString() === item.itemId);
      if (!recordItem) throw new Error(`Item ${item.itemId} not found in dispensing record`);
      if (item.quantity > recordItem.quantity) throw new Error('Return quantity exceeds dispensed quantity');
      
      // Return stock
      await returnStock(
        tenantId, 
        recordItem.drug.toString(), 
        recordItem.batch.toString(), 
        item.quantity, 
        session, 
        req.tenantDb!
      );
      
      // Update line item
      recordItem.quantity -= item.quantity;
      recordItem.totalPrice = recordItem.quantity * recordItem.unitPrice;
    }
    
    // Update overall record
    record.totalAmount = record.items.reduce((sum, item) => sum + item.totalPrice, 0);
    record.status = record.totalAmount === 0 ? DispensingStatus.RETURNED : DispensingStatus.PARTIAL;
    record.returnedAt = new Date();
    
    await record.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return sendSuccess(res, 'Return processed successfully', record);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 'Failed to process return', 400, [{ field: 'server', message: error.message }]);
  }
};
