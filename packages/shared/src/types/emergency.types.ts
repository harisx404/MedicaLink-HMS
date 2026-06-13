export type TriageLevel = 'RESUSCITATION' | 'EMERGENCY' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT';
export type TriageColor = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE';
export type ArrivalMode = 'AMBULANCE' | 'WALK_IN' | 'REFERRED' | 'POLICE';
export type Disposition = 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED' | 'DECEASED' | 'LEFT_WITHOUT_TREATMENT';

export interface IEmergencyIntervention {
  intervention: string;
  time: string;
  by: string; // User ID
  notes?: string;
}

export interface IEmergencyPatient {
  _id?: string;
  tenantId: string;
  patient?: string; // Reference to Patient if known
  unknownIdentity?: {
    gender?: 'Male' | 'Female' | 'Other';
    approximateAge?: number;
    description?: string;
  };
  triageLevel: TriageLevel;
  triageColor: TriageColor;
  triageTime?: string;
  triageBy?: string; // User ID
  chiefComplaint: string;
  arrivalMode: ArrivalMode;
  arrivalTime: string;
  mlasScore?: number;
  gcsScore?: number;
  primarySurvey?: {
    airway: string;
    breathing: string;
    circulation: string;
    disability: string;
  };
  vitals?: {
    hr?: number;
    bp?: string;
    rr?: number;
    temp?: number;
    spO2?: number;
  };
  interventions?: IEmergencyIntervention[];
  disposition?: Disposition;
  dispositionTime?: string;
  dispositionDoctor?: string; // User ID
  createdAt?: string;
  updatedAt?: string;
}

export type AmbulanceStatus = 'AVAILABLE' | 'DISPATCHED' | 'ON_SCENE' | 'TRANSPORTING' | 'RETURNING';

export interface IAmbulance {
  _id?: string;
  tenantId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  paramedic?: string; // User ID
  currentStatus: AmbulanceStatus;
  location?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  currentCallId?: string; // Reference to EmergencyPatient
  createdAt?: string;
  updatedAt?: string;
}
