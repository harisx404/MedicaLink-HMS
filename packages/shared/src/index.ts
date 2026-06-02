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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
