import { Connection } from 'mongoose';
import { getEmployeeModel } from '../models/Employee';
import { getAttendanceModel } from '../models/Attendance';
import { getLeaveModel } from '../models/Leave';
import { getPayrollModel } from '../models/Payroll';
import { getCounterModel } from '../models/Counter';
import { AppError } from '../middlewares/errorHandler';
import { PayrollStatus, AttendanceStatus } from '@medicalink/shared';

export const hrService = {
  generateEmployeeId: async (tenantDb: Connection, tenantId: string): Promise<string> => {
    const Counter = getCounterModel(tenantDb);
    const counter = await Counter.findOneAndUpdate(
      { _id: `EMP-${tenantId}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const year = new Date().getFullYear();
    return `EMP-${year}-${counter.seq.toString().padStart(4, '0')}`;
  },

  calculateWorkingHours: (checkIn: Date, checkOut: Date): { hours: number; overtime: number } => {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    const standardHours = 8;
    const overtime = hours > standardHours ? hours - standardHours : 0;
    return { hours: Number(hours.toFixed(2)), overtime: Number(overtime.toFixed(2)) };
  },

  generatePayrollDraft: async (tenantDb: Connection, employeeId: string, month: number, year: number, tenantId: string) => {
    const Employee = getEmployeeModel(tenantDb);
    const Attendance = getAttendanceModel(tenantDb);
    const Payroll = getPayrollModel(tenantDb);

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    const attendances = await Attendance.find({
      employee: employeeId,
      tenantId,
      date: { $gte: startDate, $lte: endDate },
    });

    const presentDays = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const halfDays = attendances.filter(a => a.status === AttendanceStatus.HALF_DAY).length;
    const totalWorkingDays = presentDays + (halfDays * 0.5);

    const proratedFactor = Math.min(totalWorkingDays / 30, 1);

    const basic = (employee.payroll?.basicSalary || 0) * proratedFactor;
    const hra = (employee.payroll?.allowances?.hra || 0) * proratedFactor;
    const da = (employee.payroll?.allowances?.da || 0) * proratedFactor;
    const transport = (employee.payroll?.allowances?.transport || 0) * proratedFactor;

    const totalOvertimeHours = attendances.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
    const overtimeRate = (basic / 30 / 8) * 1.5;
    const overtimePay = totalOvertimeHours * overtimeRate;

    const grossPay = basic + hra + da + transport + overtimePay;

    const pf = employee.payroll?.deductions?.pf || 0;
    const esi = employee.payroll?.deductions?.esi || 0;
    const totalDeductions = pf + esi;

    const netPay = grossPay - totalDeductions;

    const payroll = new Payroll({
      employee: employeeId,
      tenantId,
      month,
      year,
      earnings: { basic, hra, da, transport, overtime: overtimePay, bonus: 0 },
      deductions: { pf, esi, tax: 0, advance: 0, loan: 0 },
      grossPay,
      totalDeductions,
      netPay,
      status: PayrollStatus.DRAFT,
    });

    return await payroll.save();
  },

  getLeaveSummary: async (tenantDb: Connection, employeeId: string, year: number, tenantId: string) => {
    const Leave = getLeaveModel(tenantDb);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const leaves = await Leave.find({
      employee: employeeId,
      tenantId,
      fromDate: { $gte: startDate, $lte: endDate },
    });

    const summary = leaves.reduce((acc, leave) => {
      const type = leave.leaveType;
      if (!acc[type]) {
        acc[type] = { total: 0, approved: 0, pending: 0 };
      }
      acc[type].total += leave.totalDays;
      if (leave.status === 'APPROVED') acc[type].approved += leave.totalDays;
      if (leave.status === 'PENDING') acc[type].pending += leave.totalDays;
      return acc;
    }, {} as Record<string, any>);

    return summary;
  }
};
