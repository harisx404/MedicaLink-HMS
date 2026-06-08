import { Request, Response } from 'express';
import { Connection } from 'mongoose';
import { asyncHandler } from '../middlewares/errorHandler';
import { doctorService } from '../services/doctorService';
import { sendSuccess } from '../utils/apiResponse';
import { RequestHandler } from 'express';

interface IDoctorController {
  listDoctors: RequestHandler;
  getDoctor: RequestHandler;
  createDoctor: RequestHandler;
  updateDoctor: RequestHandler;
  getSchedule: RequestHandler;
  updateSchedule: RequestHandler;
  updateStatus: RequestHandler;
}

export const doctorController: IDoctorController = {
  listDoctors: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const result = await doctorService.listDoctors(tenantDb, req.query as unknown as Record<string, string | undefined>);
    return sendSuccess(res, 'Doctors retrieved successfully', { doctors: result.doctors, pagination: result.pagination });
  }),

  getDoctor: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const doctor = await doctorService.getDoctorById(req.params.id as string, tenantDb);
    return sendSuccess(res, 'Doctor retrieved successfully', { doctor });
  }),

  createDoctor: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const doctor = await doctorService.createDoctor(req.body, tenantDb);
    return sendSuccess(res, 'Doctor created successfully', { doctor });
  }),

  updateDoctor: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const doctor = await doctorService.updateDoctor(req.params.id as string, req.body, tenantDb);
    return sendSuccess(res, 'Doctor updated successfully', { doctor });
  }),

  getSchedule: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const doctor = await doctorService.getDoctorById(req.params.id as string, tenantDb);
    return sendSuccess(res, 'Schedule retrieved successfully', { schedule: doctor.weeklySchedule });
  }),

  updateSchedule: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const doctor = await doctorService.updateSchedule(req.params.id as string, req.body.weeklySchedule, tenantDb);
    return sendSuccess(res, 'Schedule updated successfully', { doctor });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const tenantDb = req.tenantDb as Connection;
    const { status } = req.body;
    const doctor = await doctorService.updateStatus(req.params.id as string, status, tenantDb);
    
    // Broadcast status update
    import('../sockets/index.js').then(({ emitToTenant }) => {
      emitToTenant((req.headers['x-tenant-slug'] as string) || '', 'DOCTOR_STATUS_UPDATE', {
        doctorId: doctor.id,
        status: doctor.currentStatus
      });
    });

    return sendSuccess(res, 'Status updated successfully', { doctor });
  })
};
