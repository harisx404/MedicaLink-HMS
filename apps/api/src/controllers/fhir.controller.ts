import { Request, Response, NextFunction } from 'express';
import { getPatientModel } from '../models/Patient';
import { getVitalsModel } from '../models/Vitals';
import { FhirService } from '../services/fhir.service';
import { Hl7Service } from '../services/hl7.service';
import { AppError } from '../middlewares/errorHandler';

export class FhirController {
  
  /**
   * Search for Patients (returns FHIR Bundle)
   */
  static async searchPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const Patient = getPatientModel(req.tenantDb!);
      const { name, identifier, gender } = req.query;
      
      const query: any = { tenantId: req.user!.tenantId };
      
      if (name) {
        query.$or = [
          { firstName: new RegExp(name as string, 'i') },
          { lastName: new RegExp(name as string, 'i') }
        ];
      }
      if (identifier) {
        query.uhid = identifier;
      }
      if (gender) {
        query.gender = (gender as string).toUpperCase();
      }

      const patients = await Patient.find(query).limit(50);
      
      const fhirResources = patients.map(p => FhirService.mapPatientToFhir(p));
      const bundle = FhirService.createBundle(fhirResources, 'searchset');
      
      res.status(200).json(bundle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single Patient by ID
   */
  static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const Patient = getPatientModel(req.tenantDb!);
      const patient = await Patient.findOne({ _id: req.params.id, tenantId: req.user!.tenantId });
      
      if (!patient) {
        throw new AppError('Patient not found', 404);
      }
      
      res.status(200).json(FhirService.mapPatientToFhir(patient));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search Observations (Vitals / Labs)
   */
  static async searchObservations(req: Request, res: Response, next: NextFunction) {
    try {
      const Vitals = getVitalsModel(req.tenantDb!) as any;
      const { patient } = req.query;
      
      const query: any = { tenantId: req.user!.tenantId };
      
      // FHIR query usually passes Patient reference like: Patient/12345
      if (patient) {
        const patientStr = patient as string;
        const patientId = patientStr.startsWith('Patient/') ? patientStr.split('/')[1] : patientStr;
        query.patient = patientId;
      }

      const vitals = await Vitals.find(query).sort({ recordedAt: -1 }).limit(100);
      
      const fhirResources = vitals.map((v: any) => FhirService.mapVitalsToFhir(v));
      const bundle = FhirService.createBundle(fhirResources, 'searchset');
      
      res.status(200).json(bundle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Everything for a Patient (Returns Patient + all Observations)
   * Implements the FHIR $everything operation
   */
  static async getPatientEverything(req: Request, res: Response, next: NextFunction) {
    try {
      const Patient = getPatientModel(req.tenantDb!);
      const Vitals = getVitalsModel(req.tenantDb!) as any;
      
      const patientId = req.params.id;
      
      const patient = await Patient.findOne({ _id: patientId, tenantId: req.user!.tenantId });
      if (!patient) {
        throw new AppError('Patient not found', 404);
      }

      const vitals = await Vitals.find({ patient: patientId, tenantId: req.user!.tenantId }).limit(100);
      
      const resources = [
        FhirService.mapPatientToFhir(patient),
        ...vitals.map((v: any) => FhirService.mapVitalsToFhir(v))
      ];
      
      const bundle = FhirService.createBundle(resources, 'searchset');
      res.status(200).json(bundle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * HL7 v2 Webhook
   * Receives raw text/plain HL7 messages from external systems
   */
  static async receiveHl7Message(req: Request, res: Response, next: NextFunction) {
    try {
      // The body might be raw text
      const rawMessage = typeof req.body === 'string' ? req.body : req.body.message;
      
      if (!rawMessage) {
        throw new AppError('No HL7 message provided', 400);
      }


      
      const result = await Hl7Service.processMessage(req.tenantDb!, req.user!.tenantId, rawMessage);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
