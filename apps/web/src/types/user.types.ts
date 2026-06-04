export type Role =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'SENIOR_DOCTOR'
  | 'NURSE'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST'
  | 'RECEPTIONIST'
  | 'BILLING_STAFF'
  | 'INVENTORY_MANAGER'
  | 'HR_MANAGER'
  | 'BLOOD_BANK_OFFICER'
  | 'EMERGENCY_STAFF'
  | 'PATIENT';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  tenantId?: string; // Null for SUPER_ADMIN
  departmentId?: string;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
}
