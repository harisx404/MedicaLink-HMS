export enum BloodGroup {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-"
}

export enum BloodComponentType {
  WHOLE_BLOOD = "WHOLE_BLOOD",
  PACKED_RBC = "PACKED_RBC",
  FFP = "FFP",
  PLATELETS = "PLATELETS",
  CRYOPRECIPITATE = "CRYOPRECIPITATE"
}

export enum BloodUnitStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  ISSUED = "ISSUED",
  DISCARDED = "DISCARDED",
  EXPIRED = "EXPIRED"
}

export enum BloodRequestStatus {
  PENDING = "PENDING",
  CROSS_MATCHING = "CROSS_MATCHING",
  RESERVED = "RESERVED",
  ISSUED = "ISSUED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum RequestUrgency {
  ROUTINE = "ROUTINE",
  URGENT = "URGENT",
  EMERGENCY = "EMERGENCY"
}

export interface IDonor {
  _id: string;
  tenantId: string;
  donorId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  rhFactor: string;
  phone: string;
  address: string;
  weight: number;
  lastDonationDate?: string;
  healthHistory?: string;
  eligibilityStatus: 'ELIGIBLE' | 'DEFERRED' | 'INELIGIBLE';
  donations?: any[]; // ref to BloodUnit
  createdAt: string;
  updatedAt: string;
}

export interface IBloodTestResults {
  hiv: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  hbsag: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  hcv: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  vdrl: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  malaria: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  testedAt?: string;
  testedBy?: string;
}

export interface IBloodUnit {
  _id: string;
  tenantId: string;
  unitNumber: string;
  bloodGroup: string;
  rhFactor: string;
  componentType: BloodComponentType;
  collectedFrom?: any; // IDonor ref
  externalSource?: string;
  collectedDate: string;
  expiryDate: string;
  volume: number; // in ml
  bagType: string;
  tests: IBloodTestResults;
  status: BloodUnitStatus;
  issuedTo?: any; // IPatient ref
  issuedFor?: any; // IOTCase or procedure ref
  crossmatchDone: boolean;
  crossmatchBy?: string;
  issuedAt?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBloodRequest {
  _id: string;
  tenantId: string;
  patient: any; // IPatient ref
  doctor: any; // IDoctor ref
  procedure?: any; // IOTCase ref
  bloodGroup: string;
  component: BloodComponentType;
  quantityRequested: number;
  urgency: RequestUrgency;
  clinicalHistory?: string;
  status: BloodRequestStatus;
  createdAt: string;
  updatedAt: string;
}
