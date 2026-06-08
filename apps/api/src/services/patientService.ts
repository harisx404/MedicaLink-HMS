import mongoose, { Connection } from 'mongoose';
import { AppError } from '../middlewares/errorHandler';
import { getPatientModel, PatientDocument } from '../models/Patient';
import { auditService } from './auditService';

export const patientService = {
  /**
   * Registers a new patient with duplicate checking.
   */
  async createPatient(
    tenantDb: Connection,
    tenantId: string,
    creatorId: string,
    patientData: Record<string, unknown>
  ): Promise<PatientDocument> {
    const Patient = getPatientModel(tenantDb);

    // 1. Duplicate patient detection: check if same name + DOB + phone exists
    const duplicate = await Patient.findOne({
      firstName: { $regex: new RegExp(`^${patientData.firstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${patientData.lastName}$`, 'i') },
      dateOfBirth: new Date(patientData.dateOfBirth as string),
      phone: patientData.phone,
    });

    if (duplicate) {
      throw new AppError('A patient with the same name, date of birth, and phone number already exists.', 409);
    }

    // 2. Create Patient
    const patient = new Patient({
      ...patientData,
      tenantId,
      createdBy: creatorId,
    });

    await patient.save();

    // Log the event
    await auditService.logAuthEvent('CREATE', {
      tenantId,
      actor: creatorId,
      resource: 'Patient',
      resourceId: String(patient._id),
      details: { uhid: patient.uhid, name: `${patient.firstName} ${patient.lastName}` },
    });

    return patient;
  },

  /**
   * Fetches patients with pagination and advanced filtering.
   */
  async getPatients(tenantDb: Connection, query: Record<string, string | undefined>) {
    const Patient = getPatientModel(tenantDb);
    const { q, gender, bloodGroup, registrationType, startDate, endDate, page = '1', limit = '10' } = query;

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { uhid: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }
    if (gender) filter.gender = gender;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (registrationType) filter.registrationType = registrationType;

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      filter.registrationDate = dateFilter;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Patient.find(filter).sort({ registrationDate: -1 }).skip(skip).limit(limitNum).populate('createdBy', 'firstName lastName'),
      Patient.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  /**
   * Retrieves a single patient by ID.
   */
  async getPatientById(tenantDb: Connection, patientId: string): Promise<PatientDocument> {
    const Patient = getPatientModel(tenantDb);
    const patient = await Patient.findById(patientId).populate('createdBy', 'firstName lastName');

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  },

  /**
   * Updates an existing patient.
   */
  async updatePatient(
    tenantDb: Connection,
    tenantId: string,
    editorId: string,
    patientId: string,
    updateData: Record<string, unknown>
  ): Promise<PatientDocument> {
    const Patient = getPatientModel(tenantDb);
    const patient = await Patient.findById(patientId);

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    Object.assign(patient, updateData);
    await patient.save();

    await auditService.logAuthEvent('UPDATE', {
      tenantId,
      actor: editorId,
      resource: 'Patient',
      resourceId: patientId,
      details: { updatedFields: Object.keys(updateData) },
    });

    return patient;
  },

  /**
   * Soft deletes (deactivates) a patient.
   */
  async deletePatient(tenantDb: Connection, tenantId: string, editorId: string, patientId: string): Promise<void> {
    const Patient = getPatientModel(tenantDb);
    const patient = await Patient.findById(patientId);

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    patient.isActive = false;
    await patient.save();

    await auditService.logAuthEvent('DELETE', {
      tenantId,
      actor: editorId,
      resource: 'Patient',
      resourceId: patientId,
      details: { action: 'Soft delete' },
    });
  },

  /**
   * Enable patient portal access.
   */
  async enablePortal(tenantDb: Connection, tenantId: string, editorId: string, patientId: string): Promise<PatientDocument> {
    const Patient = getPatientModel(tenantDb);
    const patient = await Patient.findById(patientId);

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    if (patient.isPortalEnabled) {
      throw new AppError('Patient portal is already enabled', 400);
    }

    patient.isPortalEnabled = true;
    patient.portalUserId = new mongoose.Types.ObjectId().toString(); // Basic placeholder for portal auth ID
    await patient.save();

    await auditService.logAuthEvent('UPDATE', {
      tenantId,
      actor: editorId,
      resource: 'Patient',
      resourceId: patientId,
      details: { action: 'Enabled patient portal', portalUserId: patient.portalUserId },
    });

    return patient;
  }
};
