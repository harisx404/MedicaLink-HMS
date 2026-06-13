import { Request, Response, RequestHandler } from 'express';
import { getTeleconsultationSessionModel } from '../models/TeleconsultationSession';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getSocketServer } from '../sockets';
import { TeleconsultationStatus } from '@medicalink/shared';

export const getSessions: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const SessionModel = getTeleconsultationSessionModel(tenantDb);
  
  // If user is a doctor, filter by their ID. For testing we might just return all for this tenant.
  // We'll return all active/waiting for today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const sessions = await SessionModel.find({ 
    tenantId,
    scheduledAt: { $gte: startOfDay }
  }).sort({ scheduledAt: 1 });
  
  sendSuccess(res, 'Sessions fetched', sessions);
});

export const getSessionById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const SessionModel = getTeleconsultationSessionModel(tenantDb);
  const session = await SessionModel.findOne({ _id: req.params.id, tenantId });
  
  if (!session) throw new AppError('Session not found', 404);
  
  sendSuccess(res, 'Session fetched', session);
});

export const createSession: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const SessionModel = getTeleconsultationSessionModel(tenantDb);
  const session = await SessionModel.create({ ...req.body, tenantId });
  
  sendSuccess(res, 'Session created', session, 201);
});

export const updateSessionStatus: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { status } = req.body;
  
  const SessionModel = getTeleconsultationSessionModel(tenantDb);
  const session = await SessionModel.findOne({ _id: req.params.id, tenantId });
  
  if (!session) throw new AppError('Session not found', 404);
  
  session.status = status;
  
  if (status === TeleconsultationStatus.ACTIVE && !session.actualStartAt) {
    session.actualStartAt = new Date().toISOString();
  }
  
  if (status === TeleconsultationStatus.COMPLETED && !session.actualEndAt) {
    session.actualEndAt = new Date().toISOString();
    if (session.actualStartAt) {
      session.duration = Math.round((new Date(session.actualEndAt).getTime() - new Date(session.actualStartAt).getTime()) / 60000);
    }
  }
  
  await session.save();
  
  getSocketServer().to(req.params.id as string).emit('session-updated', session);
  
  sendSuccess(res, 'Session status updated', session);
});
