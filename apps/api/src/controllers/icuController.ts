import { Request, Response, RequestHandler } from 'express';
import { getICUPatientModel } from '../models/ICUPatient';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AlertService } from '../services/alertService';
import { getSocketServer } from '../sockets';

export const admitToICU: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const data = req.body;

  const ICUPatient = getICUPatientModel(tenantDb);

  const newICUPatient = new ICUPatient({
    tenantId,
    ...data,
    admittedBy: req.user?.userId
  });

  await newICUPatient.save();
  
  getSocketServer().to(tenantId).emit('icu:patient-admitted', newICUPatient);

  sendSuccess(res, 'Patient admitted to ICU', newICUPatient, 201);
});

export const getICUPatients: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  
  const ICUPatient = getICUPatientModel(tenantDb);

  const patients = await ICUPatient.find({ tenantId, isActive: true })
    .populate('patient')
    .populate('ward')
    .populate('bed');

  sendSuccess(res, 'ICU patients fetched', patients);
});

export const getICUPatientById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;

  const ICUPatient = getICUPatientModel(tenantDb);

  const patient = await ICUPatient.findOne({ _id: id, tenantId })
    .populate('patient')
    .populate('ward')
    .populate('bed')
    .populate('admittedBy', 'firstName lastName');

  if (!patient) throw new AppError('ICU patient not found', 404);

  sendSuccess(res, 'ICU patient details', patient);
});

export const addVitals: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const vitals = req.body;

  const ICUPatient = getICUPatientModel(tenantDb);

  const patient = await ICUPatient.findOneAndUpdate(
    { _id: id, tenantId },
    { $push: { hourlyVitals: vitals } },
    { new: true }
  );

  if (!patient) throw new AppError('ICU patient not found', 404);

  if (vitals.hr > 130 || vitals.hr < 40) {
    AlertService.sendCriticalVitalAlert(tenantId, id as string, 'Heart Rate', vitals.hr);
  }
  if (vitals.spO2 < 90) {
    AlertService.sendCriticalVitalAlert(tenantId, id as string, 'SpO2', vitals.spO2);
  }

  getSocketServer().to(tenantId).emit('icu:vitals-updated', { patientId: id, vitals });

  sendSuccess(res, 'Vitals added successfully', patient);
});

export const updateVentilator: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const ventilatorSettings = req.body;

  ventilatorSettings.updatedAt = new Date();

  const ICUPatient = getICUPatientModel(tenantDb);

  const patient = await ICUPatient.findOneAndUpdate(
    { _id: id, tenantId },
    { ventilator: ventilatorSettings },
    { new: true }
  );

  if (!patient) throw new AppError('ICU patient not found', 404);

  getSocketServer().to(tenantId).emit('icu:ventilator-updated', { patientId: id, ventilator: ventilatorSettings });

  sendSuccess(res, 'Ventilator settings updated', patient);
});

export const updateFluidBalance: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const fluidData = req.body;

  const totalInput = (fluidData.input.oral || 0) + (fluidData.input.iv || 0) + (fluidData.input.blood || 0);
  const totalOutput = (fluidData.output.urine || 0) + (fluidData.output.drain || 0) + (fluidData.output.nasogastric || 0);
  fluidData.balance = totalInput - totalOutput;

  const ICUPatient = getICUPatientModel(tenantDb);

  const patient = await ICUPatient.findOneAndUpdate(
    { _id: id, tenantId },
    { $push: { fluidBalance: fluidData } },
    { new: true }
  );

  if (!patient) throw new AppError('ICU patient not found', 404);

  getSocketServer().to(tenantId).emit('icu:fluids-updated', { patientId: id, fluidData });

  sendSuccess(res, 'Fluid balance updated', patient);
});
