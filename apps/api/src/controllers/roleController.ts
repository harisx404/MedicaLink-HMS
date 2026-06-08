import { Request, Response, RequestHandler } from 'express';
import { getRoleModel } from '../models/Role';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getRoles: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const RoleModel = getRoleModel(db);
  const roles = await RoleModel.find({ tenantId }).sort({ createdAt: -1 });

  sendSuccess(res, 'Roles retrieved', roles);
});

export const createRole: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const RoleModel = getRoleModel(db);
  const role = await RoleModel.create({ ...req.body, tenantId });

  sendSuccess(res, 'Role created', role, 201);
});

export const updateRole: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const RoleModel = getRoleModel(db);
  const role = await RoleModel.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { $set: req.body },
    { new: true }
  );

  if (!role) return sendError(res, 'Role not found', 404);
  sendSuccess(res, 'Role updated', role);
});

export const deleteRole: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;
  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const RoleModel = getRoleModel(db);
  const role = await RoleModel.findOneAndDelete({ _id: req.params.id, tenantId });

  if (!role) return sendError(res, 'Role not found', 404);
  sendSuccess(res, 'Role deleted');
});
