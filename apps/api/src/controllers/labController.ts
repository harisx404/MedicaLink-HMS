import { Request, Response } from 'express';
import { getLabOrderModel } from '../models/LabOrder';
import { getLabResultModel } from '../models/LabResult';
import { getTestCatalogModel } from '../models/TestCatalog';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LabOrderStatus } from '@medicalink/shared';
import { LabService } from '../services/labService';

// Generate unique order number
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]!.replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LAB-${dateStr}-${random}`;
};

export const createOrder = async (req: Request, res: Response) => {
  const session = await req.tenantDb!.startSession();
  session.startTransaction();

  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const LabResult = getLabResultModel(req.tenantDb!);
    const orderData = req.body;
    
    // Create the order
    const newOrder = new LabOrder({
      ...orderData,
      tenantId: req.user?.tenantId,
      orderNumber: generateOrderNumber(),
      status: LabOrderStatus.ORDERED,
      orderedAt: new Date()
    });
    
    await newOrder.save({ session });
    
    // Pre-create pending results for each test in the order
    const resultPromises = newOrder.tests.map(async (test) => {
      const newResult = new LabResult({
        tenantId: req.user?.tenantId,
        labOrder: newOrder._id,
        test: test.testId,
        parameters: [], // Will be populated when entering results based on test catalog
        status: 'PENDING'
      });
      return newResult.save({ session });
    });
    
    await Promise.all(resultPromises);
    
    await session.commitTransaction();
    return sendSuccess(res, 'Lab order created successfully', newOrder, 201);
  } catch (error: any) {
    await session.abortTransaction();
    return sendError(res, 'Failed to create lab order', 500, [{ field: 'server', message: error.message }]);
  } finally {
    session.endSession();
  }
};

export const listOrders = async (req: Request, res: Response) => {
  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const { status, patientId, startDate, endDate } = req.query;
    
    let query: any = { tenantId: req.user?.tenantId };
    
    if (status) {
      query.status = status;
    }
    
    if (patientId) {
      query.patient = patientId;
    }
    
    if (startDate && endDate) {
      query.orderDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const orders = await LabOrder.find(query)
      .populate('patient', 'firstName lastName uhid gender dateOfBirth phone')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    return sendSuccess(res, 'Lab orders retrieved', orders);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch lab orders', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const LabResult = getLabResultModel(req.tenantDb!);
    const { id } = req.params;
    
    const order = await LabOrder.findOne({ _id: id, tenantId: req.user?.tenantId })
      .populate('patient', 'firstName lastName uhid gender dateOfBirth phone address')
      .populate('doctor', 'firstName lastName specialization');
      
    if (!order) {
      return sendError(res, 'Lab order not found', 404);
    }
    
    const results = await LabResult.find({ labOrder: id, tenantId: req.user?.tenantId })
      .populate('test', 'code name category parameters');
      
    return sendSuccess(res, 'Order details retrieved', { order, results });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch order details', 500, [{ field: 'server', message: error.message }]);
  }
};

export const collectSample = async (req: Request, res: Response) => {
  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const { id } = req.params;
    const { sampleBarcode } = req.body;
    
    const order = await LabOrder.findOneAndUpdate(
      { _id: id, tenantId: req.user?.tenantId },
      { 
        $set: { 
          status: LabOrderStatus.SAMPLE_COLLECTED,
          sampleBarcode,
          collectedBy: (req.user as any)?.userId || (req.user as any)?.id,
          collectedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!order) {
      return sendError(res, 'Lab order not found', 404);
    }
    
    return sendSuccess(res, 'Sample collected successfully', order);
  } catch (error: any) {
    return sendError(res, 'Failed to collect sample', 500, [{ field: 'server', message: error.message }]);
  }
};

export const enterResult = async (req: Request, res: Response) => {
  try {
    const LabResult = getLabResultModel(req.tenantDb!);
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const { resultId } = req.params;
    const { parameters, interpretation, comments, hasDeltaCheck, deltaWarning } = req.body;
    
    const existingResult = await LabResult.findOne({ _id: resultId, tenantId: req.user?.tenantId });
    if (!existingResult) {
      return sendError(res, 'Lab result not found', 404);
    }

    let finalHasDeltaCheck = hasDeltaCheck;
    let finalDeltaWarning = deltaWarning;

    // Run auto delta check if not explicitly provided
    if (hasDeltaCheck === undefined) {
      const order = await LabOrder.findById(existingResult.labOrder);
      if (order && existingResult) {
        const deltaCheck = await LabService.performDeltaCheck(
          req.user!.tenantId,
          order.patient.toString(),
          existingResult.test.toString(),
          parameters
        );
        finalHasDeltaCheck = deltaCheck.hasDeltaCheck;
        finalDeltaWarning = deltaCheck.deltaWarning;
      }
    }

    const updatedResult = await LabResult.findOneAndUpdate(
      { _id: resultId, tenantId: req.user?.tenantId },
      { 
        $set: { 
          parameters,
          interpretation,
          comments,
          hasDeltaCheck: finalHasDeltaCheck,
          deltaWarning: finalDeltaWarning,
          status: 'ENTERED',
          performedBy: (req.user as any)?.userId || (req.user as any)?.id,
          performedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!updatedResult) {
      return sendError(res, 'Lab result not found', 404);
    }
    
    // Check if all results for the order are entered to update order status
    const allResults = await LabResult.find({ labOrder: updatedResult.labOrder, tenantId: req.user?.tenantId });
    const allEntered = allResults.every(r => r.status !== 'PENDING');
    
    if (allEntered) {
      await LabOrder.findByIdAndUpdate(updatedResult.labOrder, {
        $set: { 
          status: LabOrderStatus.IN_PROGRESS, // Could be AWAITING_VERIFICATION depending on workflow
          resultEnteredAt: new Date()
        }
      });
    }
    
    return sendSuccess(res, 'Result entered successfully', updatedResult);
  } catch (error: any) {
    return sendError(res, 'Failed to enter result', 500, [{ field: 'server', message: error.message }]);
  }
};

export const verifyResult = async (req: Request, res: Response) => {
  try {
    const LabResult = getLabResultModel(req.tenantDb!);
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const { orderId } = req.params; // Verifying entire order at once for simplicity
    
    // Mark all results as verified
    await LabResult.updateMany(
      { labOrder: orderId, tenantId: req.user?.tenantId, status: 'ENTERED' },
      { 
        $set: { 
          status: 'VERIFIED',
          verifiedBy: (req.user as any)?.userId || (req.user as any)?.id,
          verifiedAt: new Date()
        } 
      }
    );
    
    // Mark order as completed
    const order = await LabOrder.findOneAndUpdate(
      { _id: orderId, tenantId: req.user?.tenantId },
      { 
        $set: { 
          status: LabOrderStatus.COMPLETED,
          verifiedAt: new Date()
        } 
      },
      { new: true }
    );
    
    return sendSuccess(res, 'Results verified successfully', order);
  } catch (error: any) {
    return sendError(res, 'Failed to verify results', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const tenantId = req.user?.tenantId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCollection, inProgress, completedToday, orders] = await Promise.all([
      LabOrder.countDocuments({ tenantId, status: LabOrderStatus.ORDERED }),
      LabOrder.countDocuments({ tenantId, status: { $in: [LabOrderStatus.SAMPLE_COLLECTED, LabOrderStatus.IN_PROGRESS] } }),
      LabOrder.countDocuments({ tenantId, status: { $in: [LabOrderStatus.COMPLETED, LabOrderStatus.REPORTED] }, updatedAt: { $gte: today } }),
      LabOrder.find({ tenantId }).sort({ createdAt: -1 }).limit(10).populate('patient', 'firstName lastName')
    ]);

    return sendSuccess(res, 'Dashboard stats retrieved', {
      pendingCollection,
      inProgress,
      completedToday,
      recentOrders: orders
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch dashboard stats', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getWorkloadReport = async (req: Request, res: Response) => {
  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const tenantId = req.user?.tenantId;

    const workload = await LabOrder.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, 'Workload report retrieved', workload);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch workload report', 500, [{ field: 'server', message: error.message }]);
  }
};

export const generateReportPdf = async (req: Request, res: Response) => {
  try {
    const LabOrder = getLabOrderModel(req.tenantDb!);
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    const order = await LabOrder.findOne({ _id: id, tenantId });
    if (!order) return sendError(res, 'Lab order not found', 404);

    // Mock PDF generation and Cloudinary upload
    const mockPdfUrl = `https://res.cloudinary.com/demo/image/upload/v1614777553/sample.pdf`;
    
    order.status = LabOrderStatus.REPORTED;
    order.reportedAt = new Date();
    await order.save();

    return sendSuccess(res, 'Report PDF generated', { url: mockPdfUrl, order });
  } catch (error: any) {
    return sendError(res, 'Failed to generate report PDF', 500, [{ field: 'server', message: error.message }]);
  }
};
