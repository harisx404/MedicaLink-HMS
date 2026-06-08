import { Request, Response, RequestHandler } from 'express';
import QRCode from 'qrcode';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { patientService } from '../services/patientService';
import { AIService } from '../services/aiService';
import { WhatsAppService } from '../services/whatsappService';
import { sendSuccess } from '../utils/apiResponse';

export const patientController: {
  registerPatient: RequestHandler;
  getPatients: RequestHandler;
  getPatientById: RequestHandler;
  updatePatient: RequestHandler;
  deletePatient: RequestHandler;
  getPatientVisits: RequestHandler;
  getPatientBills: RequestHandler;
  getPatientPrescriptions: RequestHandler;
  getPatientLabResults: RequestHandler;
  uploadDocuments: RequestHandler;
  searchPatients: RequestHandler;
  generateQrCode: RequestHandler;
  enablePortal: RequestHandler;
  generateClinicalSummary: RequestHandler;
  chatWithAssistant: RequestHandler;
} = {
  registerPatient: asyncHandler(async (req: Request, res: Response) => {
    // req.tenantDb is attached by the tenant middleware
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    // User from the auth middleware
    const creatorId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!creatorId || !tenantId) throw new AppError('Unauthorized', 401);

    const data = req.body;
    const patient = await patientService.createPatient(
      req.tenantDb,
      tenantId,
      creatorId,
      data
    );

    // Fire and forget WhatsApp welcome message
    WhatsAppService.sendWelcomeMessage(
      patient.phone, 
      patient.firstName, 
      patient.uhid
    ).catch(err => console.error('WhatsApp dispatch failed:', err));

    return sendSuccess(res, 'Patient registered successfully', { patient }, 201);
  }),

  getPatients: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const result = await patientService.getPatients(req.tenantDb, req.query as unknown as Record<string, string | undefined>);
    return res.status(200).json({
      success: true,
      message: 'Patients fetched successfully',
      data: result.data,
      pagination: result.pagination
    });
  }),

  getPatientById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const patientId = req.params.id as string;
    const patient = await patientService.getPatientById(req.tenantDb, patientId);
    return sendSuccess(res, 'Patient fetched successfully', { patient }, 200);
  }),

  updatePatient: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const editorId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!editorId || !tenantId) throw new AppError('Unauthorized', 401);

    const patientId = req.params.id as string;
    const patient = await patientService.updatePatient(
      req.tenantDb,
      tenantId,
      editorId,
      patientId,
      req.body
    );

    return sendSuccess(res, 'Patient updated successfully', { patient }, 200);
  }),

  deletePatient: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const editorId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!editorId || !tenantId) throw new AppError('Unauthorized', 401);

    const patientId = req.params.id as string;
    await patientService.deletePatient(
      req.tenantDb,
      tenantId,
      editorId,
      patientId
    );

    return sendSuccess(res, 'Patient deactivated successfully', null, 200);
  }),

  getPatientVisits: asyncHandler(async (req: Request, res: Response) => {
    // Stub for Phase 6 (Appointments)
    return sendSuccess(res, 'Visits fetched successfully', { visits: [] }, 200);
  }),

  getPatientBills: asyncHandler(async (req: Request, res: Response) => {
    // Stub for Phase 10 (Billing)
    return sendSuccess(res, 'Bills fetched successfully', { bills: [] }, 200);
  }),

  getPatientPrescriptions: asyncHandler(async (req: Request, res: Response) => {
    // Stub for Phase 8 (Pharmacy)
    return sendSuccess(res, 'Prescriptions fetched successfully', { prescriptions: [] }, 200);
  }),

  getPatientLabResults: asyncHandler(async (req: Request, res: Response) => {
    // Stub for Phase 9 (Laboratory)
    return sendSuccess(res, 'Lab results fetched successfully', { labResults: [] }, 200);
  }),

  uploadDocuments: asyncHandler(async (req: Request, res: Response) => {
    // Assume multer/Cloudinary middleware processes the files and attaches them to req.file or req.files
    // Real logic will be implemented with cloud storage setup
    return sendSuccess(res, 'Documents uploaded successfully', { documents: [] }, 200);
  }),

  searchPatients: asyncHandler(async (req: Request, res: Response) => {
    // Alias to getPatients with query parsing
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const result = await patientService.getPatients(req.tenantDb, req.query as unknown as Record<string, string | undefined>);
    return res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result.data,
      pagination: result.pagination
    });
  }),

  generateQrCode: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const tenantId = req.user?.tenantId;
    const patientId = req.params.id as string;
    const patient = await patientService.getPatientById(req.tenantDb, patientId);
    
    const qrData = JSON.stringify({
      id: patient._id,
      uhid: patient.uhid,
      name: `${patient.firstName} ${patient.lastName}`,
      tenant: tenantId || 'unknown'
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    return sendSuccess(res, 'QR Code generated', { qrCode: qrCodeDataUrl }, 200);
  }),

  enablePortal: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const editorId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!editorId || !tenantId) throw new AppError('Unauthorized', 401);

    const patientId = req.params.id as string;
    const patient = await patientService.enablePortal(
      req.tenantDb,
      tenantId,
      editorId,
      patientId
    );

    return sendSuccess(res, 'Patient portal enabled successfully', { patient }, 200);
  }),

  generateClinicalSummary: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const patientId = req.params.id as string;
    const patient = await patientService.getPatientById(req.tenantDb, patientId);
    
    // Call the AIService
    const summary = await AIService.generateClinicalSummary(patient as unknown as import('@medicalink/shared').SharedPatient);
    
    return sendSuccess(res, 'Clinical summary generated successfully', { summary }, 200);
  }),

  chatWithAssistant: asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantDb) throw new AppError('Tenant DB connection missing', 500);
    
    const patientId = req.params.id as string;
    const { message } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const patient = await patientService.getPatientById(req.tenantDb, patientId);
    
    // Call the AIService
    const reply = await AIService.chatWithPatient(patient as unknown as import('@medicalink/shared').SharedPatient, message);
    
    return sendSuccess(res, 'Chat response generated', { reply }, 200);
  })
};
