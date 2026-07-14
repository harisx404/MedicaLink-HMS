import { Request, Response, NextFunction } from 'express';
import { NursingService } from '../services/nursing.service';
import { sendSuccess } from '../utils/apiResponse';

export class NursingController {
  // --- Vitals ---
  static async recordVitals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        recordedBy: req.user?.userId
      };
      const vitals = await NursingService.recordVitals(req.tenantDb!, req.user!.tenantId, data);
      sendSuccess(res, 'Vitals recorded successfully', vitals, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPatientVitals(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.params.patientId as string;
      const vitals = await NursingService.getPatientVitals(req.tenantDb!, req.user!.tenantId, patientId);
      sendSuccess(res, 'Vitals retrieved', vitals);
    } catch (error) {
      next(error);
    }
  }

  // --- Nursing Notes ---
  static async addNursingNote(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        nurse: req.user?.userId
      };
      const note = await NursingService.addNursingNote(req.tenantDb!, req.user!.tenantId, data);
      sendSuccess(res, 'Nursing note added', note, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPatientNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.params.patientId as string;
      const notes = await NursingService.getPatientNotes(req.tenantDb!, req.user!.tenantId, patientId);
      sendSuccess(res, 'Nursing notes retrieved', notes);
    } catch (error) {
      next(error);
    }
  }

  // --- Handovers ---
  static async submitHandover(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        shiftFrom: req.user?.userId
      };
      const handover = await NursingService.submitHandover(req.tenantDb!, req.user!.tenantId, data);
      sendSuccess(res, 'Handover submitted successfully', handover, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getWardHandovers(req: Request, res: Response, next: NextFunction) {
    try {
      const wardId = req.params.wardId as string;
      const handovers = await NursingService.getWardHandovers(req.tenantDb!, req.user!.tenantId, wardId);
      sendSuccess(res, 'Ward handovers retrieved', handovers);
    } catch (error) {
      next(error);
    }
  }

  // --- MAR ---
  static async administerMedication(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        administeredBy: req.user?.userId
      };
      const mar = await NursingService.administerMedication(req.tenantDb!, req.user!.tenantId, data);
      sendSuccess(res, 'Medication administration recorded', mar, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPatientMAR(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.params.patientId as string;
      const marData = await NursingService.getPatientMAR(req.tenantDb!, req.user!.tenantId, patientId);
      sendSuccess(res, 'Patient MAR retrieved', marData);
    } catch (error) {
      next(error);
    }
  }
}
