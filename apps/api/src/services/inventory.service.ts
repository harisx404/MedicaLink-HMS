import mongoose from 'mongoose';
import { AppError } from '../middlewares/errorHandler';
import { getInventoryItemModel } from '../models/InventoryItem';
import { getStockTransactionModel } from '../models/StockTransaction';

export class InventoryService {
  /**
   * Process a stock transaction and update the inventory item's current stock
   */
  static async processStockTransaction(
    connection: mongoose.Connection,
    tenantId: string,
    itemId: string,
    transactionType: 'RECEIPT' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGE',
    quantity: number,
    performedBy: string,
    options: {
      unitCost?: number;
      fromDepartment?: string;
      toDepartment?: string;
      reference?: string;
      notes?: string;
      session?: mongoose.ClientSession;
    } = {}
  ) {
    const InventoryItem = getInventoryItemModel(connection);
    const StockTransaction = getStockTransactionModel(connection);

    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    const item = await InventoryItem.findOne({ _id: itemId, tenantId }).session(options.session || null);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    let stockChange = 0;
    switch (transactionType) {
      case 'RECEIPT':
      case 'RETURN':
        stockChange = quantity;
        break;
      case 'ISSUE':
      case 'DAMAGE':
      case 'TRANSFER':
        stockChange = -quantity;
        break;
      case 'ADJUSTMENT':
        break;
    }

    const newStock = item.currentStock + stockChange;

    if (newStock < 0) {
      throw new AppError(`Insufficient stock. Current stock is ${item.currentStock}`, 400);
    }

    let updatedUnitCost = item.unitCost;
    if (transactionType === 'RECEIPT' && options.unitCost) {
      const totalCurrentValue = item.currentStock * item.unitCost;
      const newReceiptValue = quantity * options.unitCost;
      updatedUnitCost = (totalCurrentValue + newReceiptValue) / newStock;
    }

    const transaction = new StockTransaction({
      tenantId,
      item: itemId,
      transactionType,
      quantity,
      unitCost: options.unitCost || item.unitCost,
      totalCost: (options.unitCost || item.unitCost) * quantity,
      fromDepartment: options.fromDepartment,
      toDepartment: options.toDepartment,
      reference: options.reference,
      performedBy,
      notes: options.notes
    });

    await transaction.save({ session: options.session });
    
    item.currentStock = newStock;
    item.unitCost = updatedUnitCost;
    await item.save({ session: options.session });

    return { item, transaction };
  }

  static async processAdjustment(
    connection: mongoose.Connection,
    tenantId: string,
    itemId: string,
    adjustmentQuantity: number,
    performedBy: string,
    notes?: string
  ) {
    const InventoryItem = getInventoryItemModel(connection);
    const StockTransaction = getStockTransactionModel(connection);

    const item = await InventoryItem.findOne({ _id: itemId, tenantId });
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    const newStock = item.currentStock + adjustmentQuantity;
    if (newStock < 0) {
      throw new AppError(`Insufficient stock. Current stock is ${item.currentStock}`, 400);
    }

    const transaction = new StockTransaction({
      tenantId,
      item: itemId,
      transactionType: 'ADJUSTMENT',
      quantity: Math.abs(adjustmentQuantity),
      unitCost: item.unitCost,
      totalCost: item.unitCost * Math.abs(adjustmentQuantity),
      performedBy,
      notes: notes || `Stock adjusted by ${adjustmentQuantity > 0 ? '+' : ''}${adjustmentQuantity}`
    });

    await transaction.save();
    item.currentStock = newStock;
    await item.save();

    return { item, transaction };
  }

  static async getStockValuation(connection: mongoose.Connection, tenantId: string) {
    const InventoryItem = getInventoryItemModel(connection);
    
    const valuation = await InventoryItem.aggregate([
      { $match: { tenantId, isActive: true } },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitCost'] } },
          itemCount: { $sum: 1 }
        }
      }
    ]);

    const total = valuation.reduce((sum, cat) => sum + cat.totalValue, 0);

    return {
      byCategory: valuation,
      total
    };
  }
}
