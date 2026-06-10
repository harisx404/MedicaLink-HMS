export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
  DOCTOR = "DOCTOR",
  SENIOR_DOCTOR = "SENIOR_DOCTOR",
  NURSE = "NURSE",
  PHARMACIST = "PHARMACIST",
  LAB_TECHNICIAN = "LAB_TECHNICIAN",
  RADIOLOGIST = "RADIOLOGIST",
  RECEPTIONIST = "RECEPTIONIST",
  BILLING_STAFF = "BILLING_STAFF",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
  HR_MANAGER = "HR_MANAGER",
  BLOOD_BANK_OFFICER = "BLOOD_BANK_OFFICER",
  EMERGENCY_STAFF = "EMERGENCY_STAFF",
  PATIENT = "PATIENT"
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  IN_CONSULTATION = "IN_CONSULTATION",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW"
}

export enum AppointmentType {
  OPD = "OPD",
  IPD = "IPD",
  EMERGENCY = "EMERGENCY",
  TELEMEDICINE = "TELEMEDICINE",
  FOLLOW_UP = "FOLLOW_UP"
}

export enum Priority {
  NORMAL = "NORMAL",
  URGENT = "URGENT",
  EMERGENCY = "EMERGENCY"
}

export enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING"
}

export enum BedStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
  MAINTENANCE = "MAINTENANCE"
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
  UNKNOWN = "UNKNOWN"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
}

export enum TenantPlan {
  FREE = "FREE",
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE"
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  TRIAL = "TRIAL"
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: Array<{ field: string; message: string }>;
}

// Base Entity Interfaces
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  address?: Address;
}

export interface SharedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  tenantId?: string;
  departmentId?: string;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface SharedAllergy {
  allergen: string;
  type: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
  addedBy: string;
}

export interface SharedChronicCondition {
  condition: string;
  icdCode?: string;
  diagnosedDate?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'MANAGED';
}

export interface SharedCurrentMedication {
  drug: string;
  dose: string;
  frequency: string;
  prescribedBy: string;
}

export interface SharedImmunization {
  vaccine: string;
  date: string;
  nextDue?: string;
  batchNumber?: string;
}

export interface SharedInsurance {
  provider: string;
  policyNumber: string;
  memberName: string;
  validFrom: string;
  validTo: string;
  cardImage?: string;
  preauthRequired: boolean;
  tpaName?: string;
}

export interface SharedPatient {
  id: string;
  _id?: string;
  uhid: string;
  tenantId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';
  religion?: string;
  nationality: string;
  photo?: string;
  
  // Contact
  phone: string;
  altPhone?: string;
  email?: string;
  address: Address;
  
  // Emergency Contact
  emergencyContact: EmergencyContact;
  
  // Medical Info
  allergies: SharedAllergy[];
  chronicConditions: SharedChronicCondition[];
  currentMedications: SharedCurrentMedication[];
  immunizations: SharedImmunization[];
  
  // Insurance
  insurances: SharedInsurance[];
  
  // Registration
  registrationType: 'OPD' | 'IPD' | 'EMERGENCY';
  referredBy?: {
    type: 'DOCTOR' | 'HOSPITAL' | 'SELF';
    name?: string;
  };
  createdBy: string;
  registrationDate: string;
  isActive: boolean;
  
  // Patient Portal
  portalUserId?: string;
  isPortalEnabled: boolean;
  
  // Analytics
  totalVisits: number;
  lastVisitDate?: string;
  totalBilled: number;
  outstandingBalance: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Specialization {
  specialty: string;
  subSpecialty?: string;
  isPrimary: boolean;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  certificate?: string;
}

export interface Shift {
  startTime: string;
  endTime: string;
  appointmentDuration: number; // in minutes
  maxPatients: number;
  type: 'OPD' | 'IPD' | 'EMERGENCY';
}

export interface DailySchedule {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  isWorking: boolean;
  shifts: Shift[];
}

export interface ConsultationFee {
  opd: number;
  ipd: number;
  emergency: number;
  followUp: number;
  telemedicine: number;
}

export interface SharedDoctor {
  id: string;
  _id?: string;
  userId: string;
  user?: SharedUser; // when populated
  tenantId: string;
  
  registrationNumber: string;
  specializations: Specialization[];
  qualifications: Qualification[];
  experience: number;
  
  weeklySchedule: DailySchedule[];
  consultationFee: ConsultationFee;
  
  biography?: string;
  languages: string[];
  awards: string[];
  publications: string[];
  photo?: string;
  
  avgRating: number;
  totalRatings: number;
  totalConsultations: number;
  
  isAvailableToday: boolean;
  currentStatus: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE' | 'OFFLINE';
  
  createdAt: string;
  updatedAt: string;
}

export interface SharedDoctorLeave {
  id: string;
  doctorId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface SharedAppointment {
  _id?: string;
  id?: string;
  appointmentNumber: string;
  tenantId: string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  department: string | Record<string, unknown>;
  appointmentDate: string;
  timeSlot: { start: string; end: string };
  type: AppointmentType;
  status: AppointmentStatus;
  tokenNumber?: number;
  reasonForVisit?: string;
  notes?: string;
  priority: Priority;
  bookedBy?: string;
  bookedAt?: string;
  checkedInAt?: string;
  consultationStartAt?: string;
  consultationEndAt?: string;
  reminders?: Array<{ type: string; sentAt?: string; status: string }>;
  cancellation?: { reason?: string; cancelledBy?: string; cancelledAt?: string; refundStatus?: string };
  createdAt?: string;
  updatedAt?: string;
}

// Constants
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    ME: "/auth/me",
  },
  TENANTS: {
    BASE: "/tenants",
  },
  PATIENTS: {
    BASE: "/patients",
  },
  APPOINTMENTS: {
    BASE: "/appointments",
  },
};

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export interface SharedTenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  adminEmail: string;
  phone?: string;
  address?: Address;
  logo?: string;
  primaryColor: string;
  features: {
    pharmacy: boolean;
    lab: boolean;
    radiology: boolean;
    telemedicine: boolean;
    bloodBank: boolean;
    ai: boolean;
  };
  subscription: {
    planId?: string;
    startDate?: string;
    endDate?: string;
    status: string;
  };
  database: {
    name: string;
    connectionString?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  createdAt: string;
}

export interface AuthUser extends Omit<SharedUser, 'id'> {
  id: string;
}

export interface LoginRequest {
  email: string;
  password?: string; // Optional if using 2FA only or other methods later
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  requires2FA?: boolean;
}

export interface RegisterHospitalRequest {
  hospitalName: string;
  slug: string;
  adminEmail: string;
  password?: string;
  plan: TenantPlan;
}

export interface SharedConsultation {
  _id?: string;
  id?: string;
  tenantId: string;
  consultationNumber: string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  appointment: SharedAppointment | string;
  visitDate: string;
  visitType: 'OPD' | 'IPD' | 'EMERGENCY' | 'TELEMEDICINE';
  department: string | Record<string, unknown>;
  
  subjective?: {
    symptoms?: Array<{ symptom: string; duration: string; severity: string; notes?: string }>;
    reviewOfSystems?: Record<string, string>;
  };
  
  objective?: {
    vitals?: {
      bp?: { systolic: number; diastolic: number };
      pulse?: number;
      temperature?: number;
      respRate?: number;
      spO2?: number;
      weight?: number;
      height?: number;
      bmi?: number;
      painScore?: number;
      bloodGlucose?: number;
    };
    physicalExam?: Record<string, string>;
    anthropometry?: { waistCircumference?: number; hipCircumference?: number };
  };
  
  assessment?: {
    diagnoses?: Array<{
      icdCode: string;
      description: string;
      type: 'PRIMARY' | 'SECONDARY' | 'COMORBIDITY';
      severity?: string;
      status: 'PROVISIONAL' | 'CONFIRMED' | 'DIFFERENTIAL';
    }>;
    clinicalNotes?: string;
    aiSummary?: string;
  };
  
  plan?: {
    prescriptions?: SharedPrescription[] | string[];
    labOrders?: string[];
    radiologyOrders?: string[];
    procedures?: Array<{ name: string; notes?: string; scheduledDate?: string }>;
    referrals?: Array<{ speciality: string; doctorName?: string; urgency?: string; notes?: string }>;
    instructions?: string;
    followUpDate?: string;
    followUpReason?: string;
    sickLeave?: { days: number; fromDate: string; toDate: string; reason: string };
  };
  
  consultationFee?: number;
  status: 'DRAFT' | 'COMPLETED' | 'SIGNED';
  signedAt?: string;
  signedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedVitals {
  _id?: string;
  id?: string;
  tenantId: string;
  patient: SharedPatient | string;
  ward?: string | Record<string, unknown>;
  bed?: string | Record<string, unknown>;
  recordedBy: SharedUser | string;
  bp?: { systolic: number; diastolic: number };
  pulse?: number;
  temp?: number;
  respRate?: number;
  spO2?: number;
  weight?: number;
  height?: number;
  bloodGlucose?: number;
  urine?: string;
  pain?: number;
  timestamp: string;
  notes?: string;
  createdAt?: string;
}

export interface SharedPrescription {
  _id?: string;
  id?: string;
  tenantId: string;
  prescriptionNumber: string;
  consultation: SharedConsultation | string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  medications: Array<{
    drugId?: string;
    drugName: string;
    genericName?: string;
    strength?: string;
    form?: string;
    dose: string;
    doseUnit?: string;
    frequency?: { times: number; period: string; instructions?: string };
    route?: string;
    duration: string;
    quantity: number;
    whenToTake?: string;
    instructions?: string;
    isSubstitutable: boolean;
  }>;
  generalInstructions?: string;
  followUpDate?: string;
  digitalSignature?: string;
  qrCode?: string;
  pharmacyStatus: 'PENDING' | 'DISPENSED' | 'PARTIAL';
  createdAt?: string;
}

export interface ICD10Code {
  _id?: string;
  id?: string;
  code: string;
  description: string;
  category: string;
  isBillable: boolean;
}

export interface DrugFormulary {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  genericName: string;
  brand: string;
  category: string;
  therapeuticClass?: string;
  form: string;
  strength: string;
  unit?: string;
  isActive: boolean;
  isFormulary: boolean;
}

