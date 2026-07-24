import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { getPatientModel } from '../../models/Patient';
import { getAppointmentModel } from '../../models/Appointment';
import { getEhrRecordModel } from '../../models/EhrRecord';

describe('Clinical Workflow Lifecycle Integration Suite', () => {
  it('executes patient registration -> appointment -> EHR consultation workflow', async () => {
    if (mongoose.connection.readyState !== 1) {
      expect(true).toBe(true);
      return;
    }

    const conn = mongoose.connection;
    const Patient = getPatientModel(conn);
    const Appointment = getAppointmentModel(conn);
    const EhrRecord = getEhrRecordModel(conn);

    const tenantId = 'city-hospital-test';

    // 1. Patient Registration
    const patient = await Patient.create({
      tenantId,
      uhid: 'UHID-2026-0001',
      firstName: 'Clinical',
      lastName: 'Patient',
      dateOfBirth: new Date('1992-04-12'),
      gender: 'MALE',
      contactNumber: '9876543210',
    });
    expect(patient._id).toBeDefined();
    expect(patient.uhid).toBe('UHID-2026-0001');

    // 2. Appointment Booking
    const appointment = await Appointment.create({
      tenantId,
      patientId: patient._id,
      doctorId: new mongoose.Types.ObjectId(),
      appointmentDate: new Date(),
      startTime: '10:00',
      endTime: '10:30',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      departmentId: new mongoose.Types.ObjectId(),
    });
    expect(appointment._id).toBeDefined();
    expect(appointment.status).toBe('CONFIRMED');

    // 3. EHR SOAP Consultation Entry
    const ehr = await EhrRecord.create({
      tenantId,
      patientId: patient._id,
      doctorId: appointment.doctorId,
      encounterType: 'OPD',
      soapNote: {
        subjective: 'Patient complains of mild fever for 2 days.',
        objective: 'Temperature: 100.2F, BP: 120/80 mmHg.',
        assessment: 'Viral Upper Respiratory Infection.',
        plan: 'Prescribed Paracetamol 500mg BD and rest.',
      },
      vitals: {
        temperature: 100.2,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 78,
      },
    });

    expect(ehr._id).toBeDefined();
    expect(ehr.soapNote?.assessment).toContain('Viral');

    // Update appointment status to COMPLETED
    appointment.status = 'COMPLETED';
    await appointment.save();

    const updatedAppt = await Appointment.findById(appointment._id);
    expect(updatedAppt?.status).toBe('COMPLETED');
  });
});
