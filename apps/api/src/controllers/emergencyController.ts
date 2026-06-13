import { Request, Response, RequestHandler } from 'express';
import { getEmergencyPatientModel, getAmbulanceModel } from '../models/Emergency';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AlertService } from '../services/alertService';
import { getSocketServer } from '../sockets';

export const registerEmergencyPatient: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const data = req.body;

  const EmergencyPatient = getEmergencyPatientModel(tenantDb);

  const newPatient = new EmergencyPatient({
    tenantId,
    ...data,
    triageBy: req.user?.userId
  });

  await newPatient.save();
  
  // Broadcast update
  getSocketServer().to(tenantId).emit('emergency:patient-added', newPatient);

  sendSuccess(res, 'Emergency patient registered successfully', newPatient, 201);
});

export const getEmergencyPatients: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const status = req.query.status || { $ne: 'DISCHARGED' };

  const EmergencyPatient = getEmergencyPatientModel(tenantDb);

  const patients = await EmergencyPatient.find({ tenantId, disposition: status })
    .populate('patient')
    .sort({ arrivalTime: -1 });

  sendSuccess(res, 'Patients fetched', patients);
});

export const updateTriageStatus: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const { triageLevel, triageColor } = req.body;

  const EmergencyPatient = getEmergencyPatientModel(tenantDb);

  const patient = await EmergencyPatient.findOneAndUpdate(
    { _id: id, tenantId },
    { triageLevel, triageColor, triageTime: new Date(), triageBy: req.user?.userId },
    { new: true }
  ).populate('patient');

  if (!patient) throw new AppError('Patient not found', 404);

  getSocketServer().to(tenantId).emit('emergency:patient-updated', patient);

  sendSuccess(res, 'Triage status updated', patient);
});

export const getAmbulances: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;

  const Ambulance = getAmbulanceModel(tenantDb);

  const ambulances = await Ambulance.find({ tenantId }).populate('paramedic');
  sendSuccess(res, 'Ambulances fetched', ambulances);
});

export const updateAmbulanceLocation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const { lat, lng, currentStatus } = req.body;

  const Ambulance = getAmbulanceModel(tenantDb);

  const ambulance = await Ambulance.findOneAndUpdate(
    { _id: id, tenantId },
    { 
      location: { lat, lng, updatedAt: new Date() },
      ...(currentStatus && { currentStatus })
    },
    { new: true }
  );

  if (!ambulance) throw new AppError('Ambulance not found', 404);

  getSocketServer().to(tenantId).emit('emergency:ambulance-location', ambulance);

  sendSuccess(res, 'Location updated', ambulance);
});

export const dispatchAmbulance: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const tenantDb = req.tenantDb!;
  const { id } = req.params;
  const { destination, emergencyPatientId } = req.body;

  const Ambulance = getAmbulanceModel(tenantDb);

  const ambulance = await Ambulance.findOneAndUpdate(
    { _id: id, tenantId },
    { 
      currentStatus: 'DISPATCHED',
      dispatchTime: new Date()
      // You could store destination or patientId if schema allows, but mostly we just change status here
    },
    { new: true }
  );

  if (!ambulance) throw new AppError('Ambulance not found', 404);

  getSocketServer().to(tenantId).emit('emergency:ambulance-dispatched', ambulance);

  sendSuccess(res, 'Ambulance dispatched', ambulance);
});

export const triggerEmergencyAlert: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantSlug || 'default';
  const { type, location, details, patientName } = req.body;

  switch (type) {
    case 'CODE_BLUE':
      AlertService.broadcastCodeBlue(tenantId, location, patientName);
      break;
    case 'CODE_RED':
      AlertService.broadcastCodeRed(tenantId, location, details);
      break;
    case 'MCI':
      AlertService.broadcastMCI(tenantId, details);
      break;
    default:
      throw new AppError('Invalid alert type', 400);
  }

  sendSuccess(res, `${type} alert triggered successfully`);
});
