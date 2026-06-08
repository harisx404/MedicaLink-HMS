import { Request, Response } from 'express';
import { getAppointmentModel } from '../models/Appointment';
import { SchedulingService } from '../services/schedulingService';
import { Types } from 'mongoose';
import { emitQueueUpdate } from '../sockets';

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = (req.user as { id?: string; userId?: string })?.id || (req.user as { id?: string; userId?: string })?.userId;
    
    if (!tenantId || !userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const appointment = await SchedulingService.bookAppointment(
      req.body,
      tenantId,
      userId,
      req.tenantDb!
    );

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { id: doctorId } = req.params;
    const date = req.query.date as string;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const slots = await SchedulingService.getAvailableSlots(
      doctorId as string,
      String(date),
      req.tenantDb!
    );

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const Appointment = getAppointmentModel(req.tenantDb!);
    const tenantId = req.user?.tenantId;
    
    // Default filters
    const filter: Record<string, unknown> = { tenantId };
    
    if (req.query.doctorId) filter.doctor = new Types.ObjectId(req.query.doctorId as string);
    if (req.query.patientId) filter.patient = new Types.ObjectId(req.query.patientId as string);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    
    if (req.query.date) {
      const dateStr = req.query.date as string;
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName uhid phone photo')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .sort({ appointmentDate: 1, 'timeSlot.start': 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const Appointment = getAppointmentModel(req.tenantDb!);
    const { id } = req.params;
    const { status, reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    if (status === 'CHECKED_IN') appointment.checkedInAt = new Date();
    if (status === 'IN_CONSULTATION') appointment.consultationStartAt = new Date();
    if (status === 'COMPLETED') appointment.consultationEndAt = new Date();
    if (status === 'CANCELLED') {
      appointment.cancellation = {
        reason,
        cancelledBy: new Types.ObjectId((req.user as { id?: string; userId?: string })?.id || (req.user as { id?: string; userId?: string })?.userId),
        cancelledAt: new Date()
      };
    }

    await appointment.save();

    // Broadcast the update via socket
    const dateStr = appointment.appointmentDate.toISOString().split('T')[0];
    emitQueueUpdate(`${appointment.doctor.toString()}-${dateStr}`, appointment);

    res.status(200).json({
      success: true,
      message: 'Appointment status updated',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getDoctorQueue = async (req: Request, res: Response) => {
  try {
    const { id: doctorId } = req.params;
    const date = req.query.date as string;
    
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const queue = await SchedulingService.getQueueForDoctor(
      doctorId as string,
      String(date),
      req.tenantDb!
    );

    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
