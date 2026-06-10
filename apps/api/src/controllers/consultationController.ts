import { Request, Response } from 'express';
import { getTenantDb } from '../config/db';
import { getConsultationModel } from '../models/Consultation';
import { getAppointmentModel } from '../models/Appointment';
import { AppError } from '../middlewares/errorHandler';
import { getCounterModel } from '../models/Counter';
import { AIService } from '../services/aiService';

export const createConsultation = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const doctorId = req.user!.userId || (req.user as any).id;
  const { appointmentId, patientId, visitType, departmentId } = req.body;

  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb) as any;
  const Appointment = getAppointmentModel(tenantDb) as any;
  const Counter = getCounterModel(tenantDb) as any;

  // Check if consultation already exists for this appointment
  const existing = await Consultation.findOne({ appointment: appointmentId });
  if (existing) {
    return res.status(200).json({ success: true, message: 'Consultation already exists', data: existing });
  }

  // Generate Consultation Number
  const counter = await Counter.findOneAndUpdate(
    { _id: 'consultation_number', tenantId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  const seq = counter.seq.toString().padStart(6, '0');
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

  // Update appointment status
  await Appointment.findByIdAndUpdate(appointmentId, {
    status: 'IN_CONSULTATION',
    consultationStartAt: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Consultation started',
    data: consultation
  });
};

export const getConsultation = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb) as any;

  const consultation = await Consultation.findById(req.params.id)
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'userId' } })
    .populate('plan.prescriptions');

  if (!consultation || consultation.tenantId !== tenantId) {
    throw new AppError('Consultation not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Consultation retrieved',
    data: consultation
  });
};

export const updateConsultation = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb) as any;

  const consultation = await Consultation.findOneAndUpdate(
    { _id: req.params.id, tenantId, status: 'DRAFT' },
    { $set: req.body },
    { new: true }
  );

  if (!consultation) {
    throw new AppError('Consultation not found or already signed', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Consultation auto-saved',
    data: consultation
  });
};

export const signConsultation = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const doctorId = req.user!.userId || (req.user as any).id;
  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb) as any;
  const Appointment = getAppointmentModel(tenantDb) as any;

  let consultation = await Consultation.findOne({ _id: req.params.id, tenantId });
  
  if (!consultation) throw new AppError('Consultation not found', 404);
  if (consultation.status === 'SIGNED') throw new AppError('Already signed', 400);

  // Auto-generate AI summary if not present
  if (!consultation.assessment?.aiSummary) {
    try {
      const summary = await AIService.generateVisitSummary(consultation, tenantDb);
      if (summary) {
        if (!consultation.assessment) consultation.assessment = {};
        consultation.assessment.aiSummary = summary;
      }
    } catch (err) {
      console.error('AI summary failed', err);
    }
  }

  consultation.status = 'SIGNED';
  consultation.signedAt = new Date().toISOString();
  consultation.signedBy = doctorId;

  await consultation.save();

  // Update appointment status to completed
  await Appointment.findByIdAndUpdate(consultation.appointment, {
    status: 'COMPLETED',
    consultationEndAt: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: 'Consultation signed and completed',
    data: consultation
  });
};

export const getPatientConsultations = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const tenantDb = await getTenantDb(tenantId);
  const Consultation = getConsultationModel(tenantDb) as any;

  const consultations = await Consultation.find({ patient: req.params.patientId, tenantId })
    .sort({ visitDate: -1 })
    .populate({ path: 'doctor', populate: { path: 'userId' } });

  res.status(200).json({
    success: true,
    message: 'Patient consultations retrieved',
    data: consultations
  });
};
