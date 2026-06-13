import mongoose from 'mongoose';
import { getDrugModel } from '../models/Drug';
import { getDrugBatchModel, DrugBatchDocument } from '../models/DrugBatch';
import { DispensingStatus } from '@medicalink/shared';

/**
 * Validates stock and determines which batches to use based on FEFO (First Expiry First Out).
 * Returns the exact batch allocations needed to fulfill the requested quantity.
 */
export const calculateFEFOAllocation = async (
  tenantId: string,
  drugId: string,
  requestedQuantity: number,
  connection: mongoose.Connection
): Promise<{ batch: DrugBatchDocument; quantityToDeduct: number }[]> => {
  const DrugBatch = getDrugBatchModel(connection);
  
  // Get all active batches for this drug, sorted by earliest expiry first
  const activeBatches = await DrugBatch.findActiveBatches(drugId);
  
  let remainingToFulfill = requestedQuantity;
  const allocations: { batch: DrugBatchDocument; quantityToDeduct: number }[] = [];
  
  for (const batch of activeBatches) {
    if (remainingToFulfill <= 0) break;
    
    // Determine how much we can take from this batch
    const deductFromThisBatch = Math.min(batch.remainingQuantity, remainingToFulfill);
    
    allocations.push({
      batch,
      quantityToDeduct: deductFromThisBatch
    });
    
    remainingToFulfill -= deductFromThisBatch;
  }
  
  if (remainingToFulfill > 0) {
    throw new Error(`Insufficient stock for drug ID ${drugId}. Missing ${remainingToFulfill} units.`);
  }
  
  return allocations;
};

/**
 * Deducts stock from a specific drug and its allocated batches within a transaction.
 */
export const deductStock = async (
  tenantId: string,
  drugId: string,
  allocations: { batch: DrugBatchDocument; quantityToDeduct: number }[],
  session: mongoose.mongo.ClientSession,
  connection: mongoose.Connection
): Promise<void> => {
  const Drug = getDrugModel(connection);
  const DrugBatch = getDrugBatchModel(connection);
  
  // Calculate total to deduct
  const totalQuantity = allocations.reduce((sum, alloc) => sum + alloc.quantityToDeduct, 0);
  
  // 1. Update overall drug stock
  const drugUpdate = await Drug.findOneAndUpdate(
    { _id: drugId, tenantId, currentStock: { $gte: totalQuantity } },
    { $inc: { currentStock: -totalQuantity } },
    { session, new: true }
  );
  
  if (!drugUpdate) {
    throw new Error(`Failed to update main stock for drug ID ${drugId}. It may have been updated concurrently.`);
  }
  
  // 2. Update individual batch stocks
  for (const allocation of allocations) {
    const batchUpdate = await DrugBatch.findOneAndUpdate(
      { 
        _id: allocation.batch._id, 
        drug: drugId,
        remainingQuantity: { $gte: allocation.quantityToDeduct } 
      },
      { $inc: { remainingQuantity: -allocation.quantityToDeduct } },
      { session }
    );
    
    if (!batchUpdate) {
      throw new Error(`Failed to deduct stock from batch ${allocation.batch.batchNumber}.`);
    }
  }
  
  // 3. Optional: Trigger auto-reorder check if we dropped below reorder level
  if (drugUpdate.currentStock <= drugUpdate.reorderLevel) {
    //      // Emit a socket event or send notification
      // In production, this would integrate with AlertService
  }
};

/**
 * Restores stock back to batches when an item is returned.
 * It will try to restore to the exact batch if provided, otherwise the latest expiring batch.
 */
export const returnStock = async (
  tenantId: string,
  drugId: string,
  batchId: string,
  returnedQuantity: number,
  session: mongoose.mongo.ClientSession,
  connection: mongoose.Connection
): Promise<void> => {
  const Drug = getDrugModel(connection);
  const DrugBatch = getDrugBatchModel(connection);
  
  // 1. Increase overall drug stock
  await Drug.findOneAndUpdate(
    { _id: drugId, tenantId },
    { $inc: { currentStock: returnedQuantity } },
    { session }
  );
  
  // 2. Increase batch stock
  await DrugBatch.findOneAndUpdate(
    { _id: batchId, drug: drugId },
    { $inc: { remainingQuantity: returnedQuantity } },
    { session }
  );
};
