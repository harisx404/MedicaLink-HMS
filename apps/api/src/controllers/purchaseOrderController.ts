import { Request, Response } from 'express';
import { getPurchaseOrderModel } from '../models/PurchaseOrder';
import { getGoodsReceiptNoteModel } from '../models/GoodsReceiptNote';
import { getSupplierModel } from '../models/Supplier';
import { getDrugBatchModel } from '../models/DrugBatch';
import { getDrugModel } from '../models/Drug';
import { sendSuccess, sendError, sendPaginated, sendCreated } from '../utils/apiResponse';
import { PurchaseOrderStatus } from '@medicalink/shared';

// Generate PO Number
const generatePONumber = (): string => `PO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

// Generate GRN Number
const generateGRNNumber = (): string => `GRN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

export const listPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const PurchaseOrder = getPurchaseOrderModel(req.tenantDb!);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    
    const query: any = {};
    if (status) query.status = status;
    
    const total = await PurchaseOrder.countDocuments(query);
    const orders = await PurchaseOrder.find(query)
      .populate('supplier', 'name email phone')
      .populate('orderedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    return sendPaginated(res, 'Purchase orders retrieved', orders, total, page, limit);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch purchase orders', 500, [{ field: 'server', message: error.message }]);
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const PurchaseOrder = getPurchaseOrderModel(req.tenantDb!);
    
    const orderData = {
      ...req.body,
      poNumber: generatePONumber(),
      orderedBy: req.user?.userId
    };
    
    // Auto-calculate total amount based on items
    orderData.totalAmount = orderData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
    // Ensure item totals are set
    orderData.items = orderData.items.map((item: any) => ({
      ...item,
      total: item.quantity * item.rate
    }));
    
    const newPO = new PurchaseOrder(orderData);
    await newPO.save();
    
    return sendCreated(res, 'Purchase order created successfully', newPO);
  } catch (error: any) {
    return sendError(res, 'Failed to create purchase order', 500, [{ field: 'server', message: error.message }]);
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const PurchaseOrder = getPurchaseOrderModel(req.tenantDb!);
    const { id } = req.params;
    
    const po = await PurchaseOrder.findById(id);
    if (!po) return sendError(res, 'Purchase order not found', 404);
    if (po.status !== PurchaseOrderStatus.DRAFT) {
      return sendError(res, 'Only draft purchase orders can be updated', 400);
    }
    
    const updatedData = { ...req.body };
    if (updatedData.items) {
      updatedData.totalAmount = updatedData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
      updatedData.items = updatedData.items.map((item: any) => ({
        ...item,
        total: item.quantity * item.rate
      }));
    }
    
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );
    
    return sendSuccess(res, 'Purchase order updated', updatedPO);
  } catch (error: any) {
    return sendError(res, 'Failed to update purchase order', 500, [{ field: 'server', message: error.message }]);
  }
};

export const receiveGoods = async (req: Request, res: Response) => {
  const session = await req.tenantDb!.startSession();
  session.startTransaction();
  
  try {
    const PurchaseOrder = getPurchaseOrderModel(req.tenantDb!);
    const GoodsReceiptNote = getGoodsReceiptNoteModel(req.tenantDb!);
    const DrugBatch = getDrugBatchModel(req.tenantDb!);
    const Drug = getDrugModel(req.tenantDb!);
    
    const { id } = req.params;
    const { items, discrepancies } = req.body;
    
    const po = await PurchaseOrder.findById(id);
    if (!po) throw new Error('Purchase order not found');
    if (po.status === PurchaseOrderStatus.RECEIVED) throw new Error('Purchase order already fully received');
    
    // 1. Create GRN
    const grn = new GoodsReceiptNote({
      grnNumber: generateGRNNumber(),
      purchaseOrder: id,
      receivedBy: req.user?.userId,
      items,
      discrepancies,
      status: 'COMPLETED'
    });
    
    await grn.save({ session });
    
    // 2. Add PO reference
    if (!po.goodsReceiptNotes) {
      po.goodsReceiptNotes = [];
    }
    po.goodsReceiptNotes.push(grn.id);
    // Note: robust implementation would check if all quantities are fulfilled to set RECEIVED vs PARTIAL
    po.status = PurchaseOrderStatus.RECEIVED; 
    await po.save({ session });
    
    // 3. Create/Update Batches and Update Main Stock
    for (const item of items) {
      // Find the corresponding PO item to get the rate
      const poItem = po.items.find(pi => pi.drug.toString() === item.drug.toString());
      const purchaseRate = poItem?.rate || 0;
      
      // Determine MRP (simplification: generic markup or use existing)
      const drug = await Drug.findById(item.drug);
      if (!drug) continue;
      
      const batchData = {
        drug: item.drug,
        batchNumber: item.batchNumber,
        expiryDate: new Date(item.expiryDate),
        purchaseDate: new Date(),
        quantity: item.receivedQty,
        remainingQuantity: item.receivedQty,
        purchaseRate,
        mrp: drug.mrp,
        rackLocation: item.rackLocation,
        supplierId: po.supplier,
        purchaseOrderId: po._id
      };
      
      // If batch exists, increment quantity, otherwise create new
      const existingBatch = await DrugBatch.findOne({ drug: item.drug, batchNumber: item.batchNumber });
      
      if (existingBatch) {
        existingBatch.quantity += item.receivedQty;
        existingBatch.remainingQuantity += item.receivedQty;
        await existingBatch.save({ session });
      } else {
        const newBatch = new DrugBatch(batchData);
        await newBatch.save({ session });
      }
      
      // Update overall stock
      drug.currentStock += item.receivedQty;
      await drug.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    return sendCreated(res, 'Goods received and stock updated successfully', grn);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 'Failed to process goods receipt', 400, [{ field: 'server', message: error.message }]);
  }
};

// --- Supplier Endpoints ---

export const listSuppliers = async (req: Request, res: Response) => {
  try {
    const Supplier = getSupplierModel(req.tenantDb!);
    const query = { tenantId: req.user?.tenantId, isActive: true };
    
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    return sendSuccess(res, 'Suppliers retrieved', suppliers);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch suppliers', 500, [{ field: 'server', message: error.message }]);
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const Supplier = getSupplierModel(req.tenantDb!);
    const supplierData = { ...req.body, tenantId: req.user?.tenantId };
    
    const newSupplier = new Supplier(supplierData);
    await newSupplier.save();
    
    return sendCreated(res, 'Supplier created successfully', newSupplier);
  } catch (error: any) {
    return sendError(res, 'Failed to create supplier', 500, [{ field: 'server', message: error.message }]);
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const Supplier = getSupplierModel(req.tenantDb!);
    const { id } = req.params;
    
    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, tenantId: req.user?.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedSupplier) return sendError(res, 'Supplier not found', 404);
    return sendSuccess(res, 'Supplier updated', updatedSupplier);
  } catch (error: any) {
    return sendError(res, 'Failed to update supplier', 500, [{ field: 'server', message: error.message }]);
  }
};
