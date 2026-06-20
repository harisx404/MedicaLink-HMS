import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getTenantDb } from '../config/db';
import { getConsultationModel, ConsultationDocument } from '../models/Consultation';
import { getAppointmentModel } from '../models/Appointment';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { getCounterModel } from '../models/Counter';
import { AIService } from '../services/aiService';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const createConsultation: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId, userId: doctorId } = req.user;
  const { appointmentId, patientId, visitType, departmentId } = req.body;

  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb);
  const Appointment = getAppointmentModel(tenantDb);
  const Counter = getCounterModel(tenantDb);

  // Return existing consultation if one already exists for this appointment
  const existing = await (Consultation as any).findOne({ appointment: appointmentId }).lean().exec();
  if (existing) {
    return sendSuccess(res, 'Consultation already exists', existing);
  }

  // Generate auto-incremented Consultation Number
  const counter = await Counter.findOneAndUpdate(
    { _id: 'consultation_number', tenantId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter!.seq.toString().padStart(6, '0');
  const consultationNumber = `CON-${new Date().getFullYear()}-${seq}`;

  const consultation = new Consultation({
    tenantId,
    consultationNumber,
    patient: patientId,
    doctor: doctorId,
    appointment: appointmentId,
    visitDate: new Date().toISOString(),
    visitType,
    department: departmentId,
    status: 'DRAFT',
  });

  await consultation.save();

  // Mark appointment as In Consultation
  await Appointment.findByIdAndUpdate(appointmentId, {
    status: 'IN_CONSULTATION',
    consultationStartAt: new Date().toISOString(),
  });

  return sendSuccess(res, 'Consultation started', consultation, 201);
});

export const getConsultation: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId } = req.user;

  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb);

  const consultation = await (Consultation as any).findById(req.params.id)
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'userId' } })
    .populate('plan.prescriptions')
    .exec();

  if (!consultation || consultation.tenantId !== tenantId) {
    throw new AppError('Consultation not found', 404);
  }

  return sendSuccess(res, 'Consultation retrieved', consultation);
});

export const updateConsultation: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId } = req.user;

  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb);

  const consultation = await (Consultation as any).findOneAndUpdate(
    { _id: req.params.id, tenantId, status: 'DRAFT' },
    { $set: req.body },
    { new: true }
  ).exec();

  if (!consultation) throw new AppError('Consultation not found or already signed', 404);

  return sendSuccess(res, 'Consultation auto-saved', consultation);
});

export const signConsultation: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId, userId: doctorId } = req.user;

  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb);
  const Appointment = getAppointmentModel(tenantDb);

  const consultation = await (Consultation as any).findOne({ _id: req.params.id, tenantId }).exec();
  if (!consultation) throw new AppError('Consultation not found', 404);
  if (consultation.status === 'SIGNED') throw new AppError('Already signed', 400);

  // Auto-generate AI summary if not present — failure is non-fatal
  if (!consultation.assessment?.aiSummary) {
    try {
      const summary = await AIService.generateVisitSummary(
        consultation as unknown as Parameters<typeof AIService.generateVisitSummary>[0],
        tenantDb
      );
      if (summary) {
        if (!consultation.assessment) consultation.assessment = {};
        consultation.assessment.aiSummary = summary;
      }
    } catch (err) {
      logger.warn('AI summary generation failed (non-fatal):', err);
    }
  }

  consultation.status = 'SIGNED';
  consultation.signedAt = new Date().toISOString();
  consultation.signedBy = doctorId;

  await consultation.save();

  // Mark appointment as completed
  await Appointment.findByIdAndUpdate(consultation.appointment, {
    status: 'COMPLETED',
    consultationEndAt: new Date().toISOString(),
  });

  return sendSuccess(res, 'Consultation signed and completed', consultation);
});

export const getPatientConsultations: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId } = req.user;

  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb);

  const consultations = await (Consultation as any).find({
    patient: req.params.patientId,
    tenantId,
  })
    .sort({ visitDate: -1 })
    .populate({ path: 'doctor', populate: { path: 'userId' } })
    .lean()
    .exec();

  return sendSuccess(res, 'Patient consultations retrieved', consultations);
});
