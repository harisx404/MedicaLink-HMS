import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getInventoryItemModel } from '../models/InventoryItem';
import { getAssetRecordModel } from '../models/AssetRecord';
import { getStockTransactionModel } from '../models/StockTransaction';
import { getGeneralPurchaseOrderModel } from '../models/GeneralPurchaseOrder';
import { getVendorModel } from '../models/Vendor';
import { InventoryService } from '../services/inventory.service';
import { InventoryCategory, GeneralPurchaseOrderStatus } from '@medicalink/shared';

const itemSchema = z.object({
  code: z.string(),
  name: z.string(),
  category: z.nativeEnum(InventoryCategory),
  unit: z.string(),
  specifications: z.string().optional(),
  minimumStock: z.number().min(0),
  maximumStock: z.number().min(0),
  reorderLevel: z.number().min(0),
  unitCost: z.number().min(0),
  location: z.object({
    building: z.string().optional(),
    floor: z.string().optional(),
    storeroom: z.string().optional()
  }).optional(),
  isAsset: z.boolean(),
  supplier: z.string().optional(),
  isActive: z.boolean().optional()
});

const transactionSchema = z.object({
  item: z.string(),
  quantity: z.number().positive(),
  department: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  unitCost: z.number().optional()
});

export class InventoryController {
  // --- INVENTORY ITEMS ---
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const InventoryItem = getInventoryItemModel(req.tenantDb!);
      const { category, isAsset, status } = req.query;
      
      const query: any = { tenantId: req.user!.tenantId };
      if (category) query.category = category;
      if (isAsset !== undefined) query.isAsset = isAsset === 'true';
      if (status === 'ACTIVE') query.isActive = true;

      const items = await InventoryItem.find(query)
        .populate('supplier', 'name')
        .sort({ name: 1 });
        
      sendSuccess(res, 'Inventory items retrieved', items);
    } catch (error) { next(error); }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const InventoryItem = getInventoryItemModel(req.tenantDb!);
      const validData = itemSchema.parse(req.body);
      
      const item = new InventoryItem({
        ...validData,
        tenantId: req.user!.tenantId
      });
      
      await item.save();
      sendSuccess(res, 'Inventory item created successfully', item, 201);
    } catch (error) { next(error); }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const InventoryItem = getInventoryItemModel(req.tenantDb!);
      const validData = itemSchema.partial().parse(req.body);
      
      const item = await InventoryItem.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user!.tenantId },
        validData,
        { new: true, runValidators: true }
      );
      
      if (!item) throw new AppError('Inventory item not found', 404);
      sendSuccess(res, 'Inventory item updated successfully', item);
    } catch (error) { next(error); }
  }

  static async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const InventoryItem = getInventoryItemModel(req.tenantDb!);
      const items = await InventoryItem.aggregate([
        { $match: { tenantId: req.user!.tenantId, isActive: true } },
        { $addFields: { isLowStock: { $lte: ['$currentStock', '$reorderLevel'] } } },
        { $match: { isLowStock: true } },
        { $sort: { currentStock: 1 } }
      ]);
      sendSuccess(res, 'Low stock items retrieved', items);
    } catch (error) { next(error); }
  }

  // --- TRANSACTIONS ---
  static async issueStock(req: Request, res: Response, next: NextFunction) {
    try {
      const validData = transactionSchema.parse(req.body);
      const result = await InventoryService.processStockTransaction(
        req.tenantDb!,
        req.user!.tenantId,
        validData.item,
        'ISSUE',
        validData.quantity,
        req.user!.userId,
        {
          toDepartment: validData.department,
          reference: validData.reference,
          notes: validData.notes
        }
      );
      sendSuccess(res, 'Stock issued successfully', result);
    } catch (error) { next(error); }
  }

  static async receiveStock(req: Request, res: Response, next: NextFunction) {
    try {
      const validData = transactionSchema.parse(req.body);
      const result = await InventoryService.processStockTransaction(
        req.tenantDb!,
        req.user!.tenantId,
        validData.item,
        'RECEIPT',
        validData.quantity,
        req.user!.userId,
        {
          unitCost: validData.unitCost,
          reference: validData.reference,
          notes: validData.notes
        }
      );
      sendSuccess(res, 'Stock received successfully', result);
    } catch (error) { next(error); }
  }

  static async transferStock(req: Request, res: Response, next: NextFunction) {
    try {
      const validData = transactionSchema.extend({
        fromDepartment: z.string(),
        toDepartment: z.string()
      }).parse(req.body);

      const result = await InventoryService.processStockTransaction(
        req.tenantDb!,
        req.user!.tenantId,
        validData.item,
        'TRANSFER',
        validData.quantity,
        req.user!.userId,
        {
          fromDepartment: validData.fromDepartment,
          toDepartment: validData.toDepartment,
          reference: validData.reference,
          notes: validData.notes
        }
      );
      sendSuccess(res, 'Stock transferred successfully', result);
    } catch (error) { next(error); }
  }

  static async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const StockTransaction = getStockTransactionModel(req.tenantDb!);
      const { item, type, startDate, endDate } = req.query;
      
      const query: any = { tenantId: req.user!.tenantId };
      if (item) query.item = item;
      if (type) query.transactionType = type;
      if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
      }

      const transactions = await StockTransaction.find(query)
        .populate('item', 'name code')
        .populate('performedBy', 'firstName lastName')
        .populate('fromDepartment', 'name')
        .populate('toDepartment', 'name')
        .sort({ timestamp: -1 })
        .limit(100);
        
      sendSuccess(res, 'Transactions retrieved', transactions);
    } catch (error) { next(error); }
  }

  // --- ASSETS ---
  static async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const AssetRecord = getAssetRecordModel(req.tenantDb!);
      const assets = await AssetRecord.find({ tenantId: req.user!.tenantId })
        .populate('item', 'name code category')
        .populate('assignedTo', 'name');
      sendSuccess(res, 'Assets retrieved', assets);
    } catch (error) { next(error); }
  }

  static async updateAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const AssetRecord = getAssetRecordModel(req.tenantDb!);
      const asset = await AssetRecord.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user!.tenantId },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!asset) throw new AppError('Asset not found', 404);
      sendSuccess(res, 'Asset updated', asset);
    } catch (error) { next(error); }
  }

  // --- PURCHASE ORDERS ---
  static async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const GeneralPurchaseOrder = getGeneralPurchaseOrderModel(req.tenantDb!);
      const poSchema = z.object({
        poNumber: z.string(),
        vendor: z.string(),
        items: z.array(z.object({
          item: z.string(),
          quantity: z.number().min(1),
          unitRate: z.number().min(0)
        }))
      });
      const validData = poSchema.parse(req.body);
      
      let totalAmount = 0;
      const items = validData.items.map(i => {
        const total = i.quantity * i.unitRate;
        totalAmount += total;
        return { ...i, total };
      });
      
      const po = new GeneralPurchaseOrder({
        tenantId: req.user!.tenantId,
        poNumber: validData.poNumber,
        vendor: validData.vendor,
        items,
        totalAmount,
        requestedBy: req.user!.userId,
        status: GeneralPurchaseOrderStatus.DRAFT
      });
      
      await po.save();
      sendSuccess(res, 'Purchase order created', po, 201);
    } catch (error) { next(error); }
  }

  static async getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const GeneralPurchaseOrder = getGeneralPurchaseOrderModel(req.tenantDb!);
      const pos = await GeneralPurchaseOrder.find({ tenantId: req.user!.tenantId })
        .populate('vendor', 'name')
        .populate('requestedBy', 'firstName lastName')
        .populate('items.item', 'name code')
        .sort({ createdAt: -1 });
      sendSuccess(res, 'Purchase orders retrieved', pos);
    } catch (error) { next(error); }
  }

  // --- VENDORS ---
  static async getVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const Vendor = getVendorModel(req.tenantDb!);
      const vendors = await Vendor.find({ tenantId: req.user!.tenantId }).sort({ name: 1 });
      sendSuccess(res, 'Vendors retrieved', vendors);
    } catch (error) { next(error); }
  }
  
  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const Vendor = getVendorModel(req.tenantDb!);
      const vendor = new Vendor({ ...req.body, tenantId: req.user!.tenantId });
      await vendor.save();
      sendSuccess(res, 'Vendor created', vendor, 201);
    } catch (error) { next(error); }
  }

  // --- REPORTS ---
  static async getStockValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const valuation = await InventoryService.getStockValuation(req.tenantDb!, req.user!.tenantId);
      sendSuccess(res, 'Stock valuation retrieved', valuation);
    } catch (error) { next(error); }
  }
  
  static async getConsumption(req: Request, res: Response, next: NextFunction) {
    try {
      const StockTransaction = getStockTransactionModel(req.tenantDb!);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const consumption = await StockTransaction.aggregate([
        { 
          $match: { 
            tenantId: req.user!.tenantId, 
            transactionType: 'ISSUE',
            timestamp: { $gte: thirtyDaysAgo }
          } 
        },
        {
          $group: {
            _id: '$item',
            totalConsumed: { $sum: '$quantity' },
            totalValue: { $sum: '$totalCost' }
          }
        },
        {
          $lookup: {
            from: 'inventoryitems',
            localField: '_id',
            foreignField: '_id',
            as: 'itemDetails'
          }
        },
        { $unwind: '$itemDetails' },
        { $sort: { totalValue: -1 } }
      ]);
      sendSuccess(res, 'Consumption report retrieved', consumption);
    } catch (error) { next(error); }
  }
}
