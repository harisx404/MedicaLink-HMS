import type { SharedUser } from '../index';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LEAVE = 'LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export enum AttendanceMethod {
  BIOMETRIC = 'BIOMETRIC',
  MANUAL = 'MANUAL',
  APP = 'APP',
}

export enum LeaveType {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  EARNED = 'EARNED',
  MATERNITY = 'MATERNITY',
  COMPENSATORY = 'COMPENSATORY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  OFF = 'OFF',
}

export interface SharedEmployee {
  _id?: string;
  id?: string;
  userId: string | SharedUser;
  tenantId: string;
  employeeId: string;
  department: string;
  designation: string;
  reportingTo?: string | SharedUser;
  employment: {
    type: EmploymentType;
    joinDate: string;
    probationEnd?: string;
    confirmationDate?: string;
  };
  documents: Array<{
    type: string;
    url: string;
    verified: boolean;
  }>;
  bank: {
    accountNumber: string;
    bankName: string;
    ifsc: string;
    accountType: string;
  };
  payroll: {
    basicSalary: number;
    allowances: {
      hra: number;
      da: number;
      transport: number;
    };
    deductions: {
      pf: number;
      esi: number;
    };
  };
  performance: {
    lastReview?: string;
    rating?: number;
    kpi: Array<{
      metric: string;
      target: number;
      actual: number;
    }>;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedAttendance {
  _id?: string;
  id?: string;
  employee: string | SharedEmployee;
  tenantId: string;
  date: string;
  checkIn?: {
    time: string;
    location?: { lat: number; lng: number };
    method: AttendanceMethod;
  };
  checkOut?: {
    time: string;
    location?: { lat: number; lng: number };
    method: AttendanceMethod;
  };
  workingHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  notes?: string;
  regularizationRequest?: {
    reason: string;
    status: LeaveStatus;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedLeave {
  _id?: string;
  id?: string;
  employee: string | SharedEmployee;
  tenantId: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string | SharedUser;
  approverComment?: string;
  appliedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedPayroll {
  _id?: string;
  id?: string;
  employee: string | SharedEmployee;
  tenantId: string;
  month: number;
  year: number;
  earnings: {
    basic: number;
    hra: number;
    da: number;
    transport: number;
    overtime: number;
    bonus: number;
  };
  deductions: {
    pf: number;
    esi: number;
    tax: number;
    advance: number;
    loan: number;
  };
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: PayrollStatus;
  payslipUrl?: string;
  processedBy?: string | SharedUser;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedShiftSchedule {
  _id?: string;
  id?: string;
  employee: string | SharedEmployee;
  tenantId: string;
  date: string;
  shiftType: ShiftType;
  notes?: string;
  assignedBy?: string | SharedUser;
  createdAt?: string;
  updatedAt?: string;
}
