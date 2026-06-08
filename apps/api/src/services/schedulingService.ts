import { Connection, Types } from 'mongoose';
import { getDoctorModel } from '../models/Doctor';
import { getAppointmentModel } from '../models/Appointment';
import { getPatientModel } from '../models/Patient';
import { getRedisClient } from '../config/redis';
import { format, parse, addMinutes, isBefore, startOfDay, endOfDay, getDay } from 'date-fns';

const DAYS_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export class SchedulingService {
  /**
   * Get available slots for a specific doctor on a specific date.
   */
  static async getAvailableSlots(doctorId: string, dateStr: string, tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    const Appointment = getAppointmentModel(tenantDb);

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) throw new Error('Doctor not found');

    const targetDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (isNaN(targetDate.getTime())) throw new Error('Invalid date format. Use YYYY-MM-DD');

    const dayName = DAYS_MAP[getDay(targetDate)];
    
    // Find the schedule for this day
    const schedule = doctor.weeklySchedule.find(s => s.day === dayName);
    if (!schedule || !schedule.isWorking) {
      return []; // Not working on this day
    }

    // Get all non-cancelled appointments for this date
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);
    
    const existingAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: { $ne: 'CANCELLED' }
    }).lean();

    const bookedTimes = existingAppointments.map(a => a.timeSlot.start);
    const availableSlots: Array<{ start: string, end: string, type: string }> = [];

    // Generate slots
    for (const shift of schedule.shifts) {
      let currentSlotStart = parse(shift.startTime, 'HH:mm', targetDate);
      const shiftEnd = parse(shift.endTime, 'HH:mm', targetDate);

      let count = 0;
      while (isBefore(currentSlotStart, shiftEnd) && count < shift.maxPatients) {
        const currentSlotEnd = addMinutes(currentSlotStart, shift.appointmentDuration);
        
        // Ensure the slot doesn't exceed the shift end time
        if (isBefore(shiftEnd, currentSlotEnd)) {
            break;
        }

        const slotStartStr = format(currentSlotStart, 'HH:mm');
        const slotEndStr = format(currentSlotEnd, 'HH:mm');

        // Check if this slot is already booked
        if (!bookedTimes.includes(slotStartStr)) {
          availableSlots.push({
            start: slotStartStr,
            end: slotEndStr,
            type: shift.type
          });
        }

        currentSlotStart = currentSlotEnd;
        count++;
      }
    }

    return availableSlots;
  }

  /**
   * Book a new appointment
   */
  static async bookAppointment(data: { doctorId: string; patientId: string; departmentId: string; date: string; timeSlot: { start: string; end: string }; type: string; reasonForVisit: string; priority?: string; notes?: string }, tenantId: string, bookedBy: string, tenantDb: Connection) {
    const { doctorId, patientId, departmentId, date, timeSlot, type, reasonForVisit, priority = 'NORMAL', notes } = data;
    
    const lockKey = `lock:appointment:${tenantId}:${doctorId}:${date}:${timeSlot.start}`;
    
    const redis = getRedisClient();
    // Prevent double booking using Redis lock
    if (redis) {
      const lockAcquired = await redis.set(lockKey, 'LOCKED', 'EX', 10, 'NX');
      if (!lockAcquired) {
        throw new Error('This time slot is currently being booked by someone else. Please try again.');
      }
    }

    try {
      const Doctor = getDoctorModel(tenantDb);
      const Appointment = getAppointmentModel(tenantDb);
      const Patient = getPatientModel(tenantDb);

      const doctor = await Doctor.findOne({ userId: doctorId });
      if (!doctor) throw new Error('Doctor not found');

      const patient = await Patient.findById(patientId);
      if (!patient) throw new Error('Patient not found');

      const targetDate = parse(date, 'yyyy-MM-dd', new Date());
      const start = startOfDay(targetDate);
      const end = endOfDay(targetDate);

      // Verify slot is actually available
      const existingAppt = await Appointment.findOne({
        doctor: doctor._id,
        appointmentDate: { $gte: start, $lte: end },
        'timeSlot.start': timeSlot.start,
        status: { $ne: 'CANCELLED' }
      });

      if (existingAppt) {
        throw new Error('This time slot has already been booked');
      }

      // Determine Token Number (Number of appointments for this doc today + 1)
      const todaysApptsCount = await Appointment.countDocuments({
        doctor: doctor._id,
        appointmentDate: { $gte: start, $lte: end }
      });
      const tokenNumber = todaysApptsCount + 1;

      // Create Appointment
      const appointment = new Appointment({
        tenantId,
        patient: patient._id,
        doctor: doctor._id,
        department: departmentId,
        appointmentDate: targetDate,
        timeSlot,
        type,
        status: 'SCHEDULED',
        tokenNumber,
        reasonForVisit,
        notes,
        priority,
        bookedBy: new Types.ObjectId(bookedBy)
      });

      await appointment.save();
      
      // TODO: Queue up BullMQ reminders

      return appointment;
    } finally {
      const redis = getRedisClient();
      if (redis) {
        await redis.del(lockKey);
      }
    }
  }

  /**
   * Queue Management: Get today's queue for a doctor
   */
  static async getQueueForDoctor(doctorId: string, dateStr: string, tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    const Appointment = getAppointmentModel(tenantDb);

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) throw new Error('Doctor not found');

    const targetDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ['CHECKED_IN', 'IN_CONSULTATION', 'SCHEDULED', 'CONFIRMED'] }
    })
    .populate('patient', 'firstName lastName uhid photo phone')
    .sort({ tokenNumber: 1 })
    .lean();

    return appointments;
  }
}
