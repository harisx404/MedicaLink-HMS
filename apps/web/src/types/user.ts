export type Role =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'RECEPTIONIST'
  | 'BILLING_OFFICER'
  | 'PATIENT'
  | 'HR_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'RADIOLOGIST';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  tenantId?: string; // Null for SUPER_ADMIN
  departmentId?: string;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
}
