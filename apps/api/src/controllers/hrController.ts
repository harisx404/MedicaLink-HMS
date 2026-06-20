import { Request, Response, RequestHandler } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { getEmployeeModel, IEmployee } from '../models/Employee';
import { getAttendanceModel, IAttendance } from '../models/Attendance';
import { getLeaveModel } from '../models/Leave';
import { getPayrollModel } from '../models/Payroll';
import { hrService } from '../services/hrService';
import { getUserModel } from '../models/User';
import mongoose from 'mongoose';

export const getEmployees: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const { department, designation } = req.query;

  const filter: mongoose.FilterQuery<IEmployee> = { tenantId, isActive: true };
  if (department) filter.department = department as string;
  if (designation) filter.designation = designation as string;

  const Employee = getEmployeeModel(req.tenantDb);
  // Also register User model just in case it's not initialized
  getUserModel(req.tenantDb);

  const employees = await Employee.find(filter).populate('userId', 'firstName lastName email profileImage');
  sendSuccess(res, 'Employees fetched successfully', employees);
});

export const getEmployeeById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  
  const Employee = getEmployeeModel(req.tenantDb);
  getUserModel(req.tenantDb);

  const employee = await Employee.findOne({ _id: req.params.id, tenantId })
    .populate('userId', 'firstName lastName email profileImage')
    .populate('reportingTo', 'firstName lastName');

  if (!employee) throw new AppError('Employee not found', 404);
  sendSuccess(res, 'Employee fetched successfully', employee);
});

export const createEmployee: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new AppError('Tenant ID missing', 400);

  const employeeId = await hrService.generateEmployeeId(req.tenantDb, tenantId);
  
  const User = getUserModel(req.tenantDb);
  const user = await User.findOne({ _id: req.body.userId, tenantId });
  if (!user) throw new AppError('User not found in tenant', 404);

  const Employee = getEmployeeModel(req.tenantDb);
  const employee = new Employee({
    ...req.body,
    tenantId,
    employeeId,
  });

  await employee.save();
  sendSuccess(res, 'Employee created successfully', employee, 201);
});

export const updateEmployee: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  
  const Employee = getEmployeeModel(req.tenantDb);
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!employee) throw new AppError('Employee not found', 404);
  sendSuccess(res, 'Employee updated successfully', employee);
});

export const getHRDashboardStats: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  
  const Employee = getEmployeeModel(req.tenantDb);
  const Attendance = getAttendanceModel(req.tenantDb);
  const Leave = getLeaveModel(req.tenantDb);

  const totalStaff = await Employee.countDocuments({ tenantId, isActive: true });
  
  const today = new Date().toISOString().split('T')[0];
  const attendancesToday = await Attendance.find({ tenantId, date: today });
  const presentToday = attendancesToday.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
  
  const pendingLeaves = await Leave.countDocuments({ tenantId, status: 'PENDING' });

  sendSuccess(res, 'HR Stats fetched', { totalStaff, presentToday, pendingLeaves });
});

export const getAttendance: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const { date } = req.query;

  const filter: mongoose.FilterQuery<IAttendance> = { tenantId };
  if (date) filter.date = date as string;

  const Attendance = getAttendanceModel(req.tenantDb);
  getEmployeeModel(req.tenantDb);
  getUserModel(req.tenantDb);

  const attendance = await Attendance.find(filter).populate({
    path: 'employee',
    populate: { path: 'userId', select: 'firstName lastName profileImage' }
  });

  sendSuccess(res, 'Attendance fetched', attendance);
});

export const bulkMarkAttendance: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const { date, records } = req.body;

  const ops = records.map((record: { employeeId: string; status: string; notes?: string }) => ({
    updateOne: {
      filter: { employee: record.employeeId, date, tenantId },
      update: { $set: { status: record.status, notes: record.notes } },
      upsert: true,
    }
  }));

  if (ops.length > 0) {
    const Attendance = getAttendanceModel(req.tenantDb);
    await Attendance.bulkWrite(ops);
  }

  sendSuccess(res, 'Attendance marked successfully', { count: records.length });
});

export const checkIn: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;

  const Employee = getEmployeeModel(req.tenantDb);
  const employee = await Employee.findOne({ userId, tenantId });
  if (!employee) throw new AppError('Employee profile not found', 404);

  const date = new Date().toISOString().split('T')[0];
  const Attendance = getAttendanceModel(req.tenantDb);
  
  let attendance = await Attendance.findOne({ employee: employee._id, date, tenantId });
  if (attendance?.checkIn?.time) {
    throw new AppError('Already checked in today', 400);
  }

  if (!attendance) {
    attendance = new Attendance({ employee: employee._id, tenantId, date, status: 'PRESENT' });
  }
  
  attendance.checkIn = {
    time: new Date().toISOString(),
    location: req.body.location,
    method: req.body.method,
  };

  await attendance.save();
  sendSuccess(res, 'Checked in successfully', attendance);
});

export const getLeaves: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const { status, employeeId } = req.query;

  const filter: Record<string, unknown> = { tenantId };
  if (status) filter.status = status as string;
  if (employeeId) filter.employee = employeeId as string;

  const Leave = getLeaveModel(req.tenantDb);
  getEmployeeModel(req.tenantDb);
  getUserModel(req.tenantDb);

  const leaves = await Leave.find(filter)
    .populate({
      path: 'employee',
      populate: { path: 'userId', select: 'firstName lastName' }
    })
    .sort({ appliedAt: -1 });

  sendSuccess(res, 'Leaves fetched', leaves);
});

export const applyLeave: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;

  const Employee = getEmployeeModel(req.tenantDb);
  const employee = await Employee.findOne({ userId, tenantId });
  if (!employee) throw new AppError('Employee profile not found', 404);

  const { leaveType, fromDate, toDate, reason } = req.body;
  
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const Leave = getLeaveModel(req.tenantDb);
  const leave = new Leave({
    employee: employee._id,
    tenantId,
    leaveType,
    fromDate: start,
    toDate: end,
    totalDays,
    reason,
    status: 'PENDING',
  });

  await leave.save();
  sendSuccess(res, 'Leave applied successfully', leave, 201);
});

export const approveLeave: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  const { status, comment } = req.body;

  const Leave = getLeaveModel(req.tenantDb);
  const leave = await Leave.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { 
      $set: { 
        status, 
        approvedBy: userId,
        approverComment: comment 
      } 
    },
    { new: true }
  );

  if (!leave) throw new AppError('Leave request not found', 404);
  sendSuccess(res, `Leave ${status.toLowerCase()} successfully`, leave);
});

export const getPayrolls: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const { month, year, status } = req.query;

  const filter: Record<string, unknown> = { tenantId };
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  if (status) filter.status = status as string;

  const Payroll = getPayrollModel(req.tenantDb);
  getEmployeeModel(req.tenantDb);
  getUserModel(req.tenantDb);

  const payrolls = await Payroll.find(filter).populate({
    path: 'employee',
    populate: { path: 'userId', select: 'firstName lastName' }
  });

  sendSuccess(res, 'Payrolls fetched', payrolls);
});

export const generatePayrollDraft: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new AppError('Tenant ID missing', 400);
  const { employeeId, month, year } = req.body;

  const draft = await hrService.generatePayrollDraft(req.tenantDb, employeeId, month, year, tenantId);
  sendSuccess(res, 'Payroll draft generated', draft, 201);
});

export const approvePayroll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  
  const Payroll = getPayrollModel(req.tenantDb);
  const payroll = await Payroll.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { $set: { status: 'APPROVED', processedBy: userId, processedAt: new Date() } },
    { new: true }
  );

  if (!payroll) throw new AppError('Payroll not found', 404);
  sendSuccess(res, 'Payroll approved', payroll);
});
