import { Request, Response, RequestHandler } from 'express';
import { getOTCaseModel, getOperationTheaterModel } from '../models/OT';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getSocketServer } from '../sockets';

export const getTheaters: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const OperationTheater = getOperationTheaterModel(tenantDb);
  const theaters = await OperationTheater.find({ tenantId });
  
  sendSuccess(res, 'Theaters fetched', theaters);
});

export const createTheater: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const OperationTheater = getOperationTheaterModel(tenantDb);
  const theater = await OperationTheater.create({ ...req.body, tenantId });
  
  sendSuccess(res, 'Theater created', theater, 201);
});

export const getCases: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const dateStr = req.query.date as string;
  
  const query: any = { tenantId };
  
  if (dateStr) {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
  }
  
  const OTCase = getOTCaseModel(tenantDb);
  const cases = await OTCase.find(query)
    .populate('patient')
    .populate('surgeon')
    .populate('anesthesiologist')
    .populate('theater')
    .sort({ scheduledDate: 1, scheduledTime: 1 });
    
  sendSuccess(res, 'Cases fetched', cases);
});

export const getCaseById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const OTCase = getOTCaseModel(tenantDb);
  const otCase = await OTCase.findOne({ _id: req.params.id, tenantId })
    .populate('patient')
    .populate('surgeon')
    .populate('assistant')
    .populate('anesthesiologist')
    .populate('scrubNurse')
    .populate('circulatingNurse')
    .populate('theater');
    
  if (!otCase) throw new AppError('Case not found', 404);
  
  sendSuccess(res, 'Case fetched', otCase);
});

export const scheduleCase: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const OTCase = getOTCaseModel(tenantDb);
  const newCase = await OTCase.create({ ...req.body, tenantId });
  
  getSocketServer().to(tenantId).emit('ot:case-updated', newCase);
  sendSuccess(res, 'Case scheduled', newCase, 201);
});

export const updateCaseStatus: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { status } = req.body;
  
  const OTCase = getOTCaseModel(tenantDb);
  const otCase = await OTCase.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { status },
    { new: true }
  ).populate('theater').populate('patient');
  
  if (!otCase) throw new AppError('Case not found', 404);
  
  // If moving to IN_PROGRESS, mark actualStartTime if not present
  if (status === 'IN_PROGRESS' && !otCase.intraOp?.actualStartTime) {
    if (!otCase.intraOp) otCase.intraOp = {};
    otCase.intraOp.actualStartTime = new Date().toISOString();
    await otCase.save();
  }
  
  getSocketServer().to(tenantId).emit('ot:case-updated', otCase);
  sendSuccess(res, 'Case status updated', otCase);
});

export const updateCaseSection: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { section, data } = req.body; // section could be 'preOp', 'intraOp', 'postOp', 'anesthesiaRecord'
  
  if (!['preOp', 'intraOp', 'postOp', 'anesthesiaRecord'].includes(section)) {
    throw new AppError('Invalid section to update', 400);
  }
  
  const OTCase = getOTCaseModel(tenantDb);
  const otCase = await OTCase.findOne({ _id: req.params.id, tenantId });
  if (!otCase) throw new AppError('Case not found', 404);
  
  (otCase as any)[section] = { ...(otCase as any)[section], ...data };
  await otCase.save();
  
  getSocketServer().to(tenantId).emit('ot:case-updated', otCase);
  sendSuccess(res, `Case ${section} updated`, otCase);
});
