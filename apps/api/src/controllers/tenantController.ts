import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { Tenant } from '../models/Tenant';
import { AppError } from '../middlewares/errorHandler';
import { RequestHandler } from 'express';

export const tenantController: {
  listTenants: RequestHandler;
  createTenant: RequestHandler;
  getTenant: RequestHandler;
  updateTenant: RequestHandler;
  deactivateTenant: RequestHandler;
  updateFeatureFlags: RequestHandler;
} = {
  listTenants: asyncHandler(async (req: Request, res: Response) => {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    return sendSuccess(res, 'Tenants retrieved successfully', tenants);
  }),

  getTenant: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) throw new AppError('Tenant not found', 404);
    
    return sendSuccess(res, 'Tenant retrieved successfully', tenant);
  }),

  createTenant: asyncHandler(async (req: Request, res: Response) => {
    // Used directly by Super Admins bypassing the registration flow
    const tenant = await Tenant.create(req.body);
    return sendSuccess(res, 'Tenant created successfully', tenant, 201);
  }),

  updateTenant: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenant = await Tenant.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!tenant) throw new AppError('Tenant not found', 404);
    
    return sendSuccess(res, 'Tenant updated successfully', tenant);
  }),

  deactivateTenant: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenant = await Tenant.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!tenant) throw new AppError('Tenant not found', 404);
    
    return sendSuccess(res, 'Tenant deactivated successfully', tenant);
  }),

  updateFeatureFlags: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { features } = req.body;
    
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { $set: { features } },
      { new: true, runValidators: true }
    );
    if (!tenant) throw new AppError('Tenant not found', 404);
    
    return sendSuccess(res, 'Tenant features updated successfully', tenant.features);
  }),
};
