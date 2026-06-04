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
  CHECKED_IN = "CHECKED_IN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW"
}

export enum AppointmentType {
  NEW = "NEW",
  FOLLOW_UP = "FOLLOW_UP",
  TELEMEDICINE = "TELEMEDICINE"
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
  O_NEGATIVE = "O-"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
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

export interface SharedPatient {
  id: string;
  uhid: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  photo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SharedDoctor {
  id: string;
  userId: string;
  tenantId: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  isActive: boolean;
  createdAt: string;
}

export interface SharedAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string;
  timeSlot: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  tokenNumber?: number;
  createdAt: string;
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
