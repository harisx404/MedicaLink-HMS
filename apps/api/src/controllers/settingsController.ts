import { Request, Response, RequestHandler } from 'express';
import HospitalSettings from '../models/HospitalSettings';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * @desc    Get hospital settings for the current tenant
 * @route   GET /api/v1/admin/settings
 * @access  Private (Admin/SuperAdmin)
 */
export const getSettings: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return sendError(res, 'Tenant context missing', 400);
  }

  // Get the tenant's DB connection
  const db = req.tenantDb;
  if (!db) {
    return sendError(res, 'Database connection missing', 500);
  }

  // Use the tenant-specific model
  const SettingsModel = db.model('HospitalSettings', HospitalSettings.schema);

  let settings = await SettingsModel.findOne({ tenantId });

  // If no settings exist yet, create default settings
  if (!settings) {
    settings = await SettingsModel.create({
      tenantId,
      general: {
        hospitalName: 'New Hospital',
      },
    });
  }

  sendSuccess(res, 'Hospital settings retrieved successfully', settings);
});

/**
 * @desc    Update hospital settings
 * @route   PUT /api/v1/admin/settings
 * @access  Private (Admin/SuperAdmin)
 */
export const updateSettings: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return sendError(res, 'Tenant context missing', 400);
  }

  const db = req.tenantDb;
  if (!db) {
    return sendError(res, 'Database connection missing', 500);
  }

  const SettingsModel = db.model('HospitalSettings', HospitalSettings.schema);

  const updatedSettings = await SettingsModel.findOneAndUpdate(
    { tenantId },
    { $set: req.body },
    { new: true, runValidators: true, upsert: true }
  );

  sendSuccess(res, 'Hospital settings updated successfully', updatedSettings);
});
