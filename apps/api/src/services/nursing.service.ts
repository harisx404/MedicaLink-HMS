import mongoose, { Connection, Types } from 'mongoose';
import { getVitalsModel } from '../models/Vitals';
import { getNursingNoteModel } from '../models/NursingNote';
import { getHandoverModel } from '../models/Handover';
import { getMARModel } from '../models/MAR';
import { getPrescriptionModel } from '../models/Prescription';
import { AppError } from '../middlewares/errorHandler';

export class NursingService {
  /**
   * Calculates NEWS (National Early Warning Score) based on adult standard vitals.
   * Total score: 0-4 (Low risk), 5-6 (Medium risk), 7+ (High risk).
   */
  private static calculateNewsScore(vitals: { respRate?: number; spO2?: number; temp?: number; bp?: { systolic?: number }; pulse?: number }): number {
    let score = 0;

    // Respiratory Rate
    if (vitals.respRate) {
      if (vitals.respRate <= 8) score += 3;
      else if (vitals.respRate >= 9 && vitals.respRate <= 11) score += 1;
      else if (vitals.respRate >= 21 && vitals.respRate <= 24) score += 2;
      else if (vitals.respRate >= 25) score += 3;
    }

    // SpO2
    if (vitals.spO2) {
      if (vitals.spO2 <= 91) score += 3;
      else if (vitals.spO2 >= 92 && vitals.spO2 <= 93) score += 2;
      else if (vitals.spO2 >= 94 && vitals.spO2 <= 95) score += 1;
    }

    // Temperature
    if (vitals.temp) {
      if (vitals.temp <= 35.0) score += 3;
      else if (vitals.temp >= 35.1 && vitals.temp <= 36.0) score += 1;
      else if (vitals.temp >= 38.1 && vitals.temp <= 39.0) score += 1;
      else if (vitals.temp >= 39.1) score += 2;
    }

    // Systolic BP
    if (vitals.bp?.systolic) {
      if (vitals.bp.systolic <= 90) score += 3;
      else if (vitals.bp.systolic >= 91 && vitals.bp.systolic <= 100) score += 2;
      else if (vitals.bp.systolic >= 101 && vitals.bp.systolic <= 110) score += 1;
      else if (vitals.bp.systolic >= 220) score += 3;
    }

    // Heart Rate (Pulse)
    if (vitals.pulse) {
      if (vitals.pulse <= 40) score += 3;
      else if (vitals.pulse >= 41 && vitals.pulse <= 50) score += 1;
      else if (vitals.pulse >= 91 && vitals.pulse <= 110) score += 1;
      else if (vitals.pulse >= 111 && vitals.pulse <= 130) score += 2;
      else if (vitals.pulse >= 131) score += 3;
    }

    return score;
  }

  // --- Vitals ---
  static async recordVitals(connection: Connection, tenantId: string, data: any) {
    const Vitals = getVitalsModel(connection) as mongoose.Model<any>;
    
    // Auto-calculate NEWS score
    const newsScore = this.calculateNewsScore({
      respRate: data.respRate,
      spO2: data.spO2,
      temp: data.temp,
      bp: { systolic: data.bp?.systolic },
      pulse: data.pulse
    });

    const vitals = new Vitals({ ...data, tenantId, newsScore });
    await vitals.save();
    return vitals;
  }

  static async getPatientVitals(connection: Connection, tenantId: string, patientId: string) {
    const Vitals = getVitalsModel(connection) as mongoose.Model<any>;
    return Vitals.find({ tenantId, patient: patientId }).sort({ timestamp: -1 });
  }

  // --- Nursing Notes ---
  static async addNursingNote(connection: Connection, tenantId: string, data: any) {
    const NursingNote = getNursingNoteModel(connection) as mongoose.Model<any>;
    const note = new NursingNote({ ...data, tenantId });
    await note.save();
    return note.populate('nurse', 'firstName lastName role');
  }

  static async getPatientNotes(connection: Connection, tenantId: string, patientId: string) {
    const NursingNote = getNursingNoteModel(connection) as mongoose.Model<any>;
    return NursingNote.find({ tenantId, patient: patientId })
      .sort({ createdAt: -1 })
      .populate('nurse', 'firstName lastName role');
  }

  // --- Handovers ---
  static async submitHandover(connection: Connection, tenantId: string, data: any) {
    const Handover = getHandoverModel(connection) as mongoose.Model<any>;
    const handover = new Handover({ ...data, tenantId });
    await handover.save();
    return handover;
  }

  static async getWardHandovers(connection: Connection, tenantId: string, wardId: string) {
    const Handover = getHandoverModel(connection) as mongoose.Model<any>;
    return Handover.find({ tenantId, ward: wardId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('shiftFrom', 'firstName lastName')
      .populate('shiftTo', 'firstName lastName')
      .populate('criticalPatients', 'firstName lastName uhid');
  }

  // --- MAR (Medication Administration Record) ---
  static async administerMedication(connection: Connection, tenantId: string, data: any) {
    const MAR = getMARModel(connection) as mongoose.Model<any>;
    const Prescription = getPrescriptionModel(connection);

    // Verify prescription exists and medication is in it
    const prescription = await Prescription.findOne({ _id: data.prescription, tenantId });
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    const medInfo = prescription.medications.find((m: any) => m._id?.toString() === data.medicationId);
    if (!medInfo) {
      throw new AppError('Medication not found in prescription', 404);
    }

    const marEntry = new MAR({
      tenantId,
      patient: data.patient,
      prescription: data.prescription,
      medicationId: data.medicationId,
      drugName: medInfo.drugName,
      dose: medInfo.dose,
      route: medInfo.route,
      administeredBy: data.administeredBy,
      administeredAt: data.administeredAt || new Date(),
      status: data.status,
      notes: data.notes
    });

    await marEntry.save();
    
    // Per user instructions, we don't deduct inventory here, assume Pharmacy did it during Dispensing.
    return marEntry;
  }

  static async getPatientMAR(connection: Connection, tenantId: string, patientId: string) {
    const MAR = getMARModel(connection) as mongoose.Model<any>;
    const Prescription = getPrescriptionModel(connection);

    // 1. Get all active prescriptions for patient
    const activePrescriptions = await Prescription.find({ tenantId, patient: patientId, pharmacyStatus: { $ne: 'PENDING' } });
    
    // 2. Get MAR history for patient
    const marHistory = await MAR.find({ tenantId, patient: patientId })
      .sort({ administeredAt: -1 })
      .populate('administeredBy', 'firstName lastName');

    return {
      prescriptions: activePrescriptions,
      history: marHistory
    };
  }
}
