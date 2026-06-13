export enum ProcedureType {
  ELECTIVE = "ELECTIVE",
  EMERGENCY = "EMERGENCY",
  URGENT = "URGENT"
}

export enum OTCaseStatus {
  SCHEDULED = "SCHEDULED",
  IN_PREP = "IN_PREP",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface IOTChecklistItem {
  item: string;
  status: boolean;
  checkedBy?: string;
  time?: string;
}

export interface IOTImplants {
  name: string;
  lot: string;
  expiry: string;
  size: string;
}

export interface IOTSutures {
  material: string;
  size: string;
  manufacturer: string;
}

export interface IOTSpecimen {
  description: string;
  disposition: string;
}

export interface IOTDrugLog {
  drug: string;
  dose: string;
  time: string;
}

export interface IOTVitals {
  time: string;
  bp: string;
  hr: number;
  spO2: number;
}

export interface IOTCase {
  _id: string;
  tenantId: string;
  caseNumber: string;
  patient: any; // IPatient ref
  procedure: {
    name: string;
    icdProcCode?: string;
    type: ProcedureType;
  };
  surgeon: any[]; // IDoctor ref
  assistant?: any[];
  anesthesiologist?: any;
  anesthesiaType?: string;
  scrubNurse?: any; // IStaff ref
  circulatingNurse?: any;
  theater: any; // IOperationTheater ref
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // in minutes

  preOp?: {
    checklist: IOTChecklistItem[];
    consentSigned: boolean;
    consentBy?: string;
    consentDate?: string;
    bloodOrdered: boolean;
    bloodCrossmatched: boolean;
    anesthesiaAssessment: string;
  };

  intraOp?: {
    actualStartTime?: string;
    actualEndTime?: string;
    findings?: string;
    complications?: string;
    implants?: IOTImplants[];
    sutures?: IOTSutures[];
    specimens?: IOTSpecimen[];
    estimatedBloodLoss?: number;
    fluidGiven?: number;
    surgeonNotes?: string;
  };

  anesthesiaRecord?: {
    induction?: string;
    maintenance?: string;
    reversal?: string;
    drugs?: IOTDrugLog[];
    vitalsIntraOp?: IOTVitals[];
    complications?: string;
  };

  postOp?: {
    recoveryStartTime?: string;
    recoveryEndTime?: string;
    aldreteScore?: number;
    instructions?: string;
    complications?: string;
    transferTo?: string; // Ward or ICU ref
  };

  status: OTCaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IOperationTheater {
  _id: string;
  tenantId: string;
  name: string;
  type: string; // e.g. Major, Minor, Cardiac
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  capabilities?: string[];
}
