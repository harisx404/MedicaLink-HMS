import { z } from 'zod';
import { EmploymentType, AttendanceStatus, AttendanceMethod, LeaveType, LeaveStatus, ShiftType } from '@medicalink/shared';

export const createEmployeeSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    reportingTo: z.string().optional(),
    employment: z.object({
      type: z.nativeEnum(EmploymentType),
      joinDate: z.string(),
      probationEnd: z.string().optional(),
      confirmationDate: z.string().optional(),
    }),
    bank: z.object({
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      ifsc: z.string().optional(),
      accountType: z.string().optional(),
    }).optional(),
    payroll: z.object({
      basicSalary: z.number().min(0).default(0),
      allowances: z.object({
        hra: z.number().min(0).default(0),
        da: z.number().min(0).default(0),
        transport: z.number().min(0).default(0),
      }).optional(),
      deductions: z.object({
        pf: z.number().min(0).default(0),
        esi: z.number().min(0).default(0),
      }).optional(),
    }).optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    department: z.string().optional(),
    designation: z.string().optional(),
    reportingTo: z.string().optional(),
    employment: z.object({
      type: z.nativeEnum(EmploymentType).optional(),
      joinDate: z.string().optional(),
      probationEnd: z.string().optional(),
      confirmationDate: z.string().optional(),
    }).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const bulkMarkAttendanceSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    records: z.array(z.object({
      employeeId: z.string(),
      status: z.nativeEnum(AttendanceStatus),
      notes: z.string().optional(),
    })),
  }),
});

export const checkInSchema = z.object({
  body: z.object({
    method: z.nativeEnum(AttendanceMethod),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
});

export const regularizeAttendanceSchema = z.object({
  body: z.object({
    reason: z.string().min(1, "Reason is required"),
  }),
});

export const applyLeaveSchema = z.object({
  body: z.object({
    leaveType: z.nativeEnum(LeaveType),
    fromDate: z.string(),
    toDate: z.string(),
    reason: z.string().min(1, "Reason is required"),
  }),
});

export const generatePayrollSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    month: z.number().min(1).max(12),
    year: z.number().min(2000).max(2100),
  }),
});

export const createShiftScheduleSchema = z.object({
  body: z.object({
    employeeId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    shiftType: z.nativeEnum(ShiftType),
    notes: z.string().optional(),
  }),
});
