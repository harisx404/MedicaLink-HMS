export type LineType = 'CENTRAL' | 'ARTERIAL' | 'PERIPHERAL' | 'FOLEY';
export type LineStatus = 'ACTIVE' | 'REMOVED';

export interface IICUVitalEntry {
  time: string;
  bp: string; // e.g., 120/80
  hr: number;
  temp: number;
  spO2: number;
  rr: number;
  cvp?: number;
  map?: number;
}

export interface IFluidBalance {
  date: string; // YYYY-MM-DD
  input: {
    oral: number;
    iv: number;
    blood: number;
  };
  output: {
    urine: number;
    drain: number;
    nasogastric: number;
  };
  balance: number;
}

export interface IICUVentilator {
  isOnVentilator: boolean;
  mode?: string;
  fiO2?: number;
  peep?: number;
  tv?: number;
  rr?: number;
  settings?: Record<string, string | number>;
  updatedAt?: string;
}

export interface IICULine {
  _id?: string;
  type: LineType;
  insertedAt: string;
  site: string;
  status: LineStatus;
  removedAt?: string;
}

export interface IICUInfusion {
  _id?: string;
  drug: string;
  concentration: string;
  rate: string; // e.g., "5 ml/hr"
  startTime: string;
  endTime?: string;
}

export interface IICUPatient {
  _id?: string;
  tenantId: string;
  patient: any; // Populated patient
  ward: any;
  bed: any;
  admittedAt: string;
  admittedBy: string; // User ID
  admissionDiagnosis: string;
  apacheScore?: number;
  sofaScore?: number;
  
  ventilator?: IICUVentilator;
  hourlyVitals?: IICUVitalEntry[];
  fluidBalance?: IFluidBalance[];
  lines?: IICULine[];
  infusions?: IICUInfusion[];

  isActive: boolean;
  dischargedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
