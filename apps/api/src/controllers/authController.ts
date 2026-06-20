import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/apiResponse';
import { env } from '../config/env';
import mongoose, { Connection } from 'mongoose';
import { RequestHandler } from 'express';
import { Tenant as TenantModel } from '../models/Tenant';
import { getPushTokenModel } from '../models/PushToken';

export const authController: {
  registerHospital: RequestHandler;
  login: RequestHandler;
  refresh: RequestHandler;
  logout: RequestHandler;
  forgotPassword: RequestHandler;
  resetPassword: RequestHandler;
  verifyEmail: RequestHandler;
  setup2FA: RequestHandler;
  enable2FA: RequestHandler;
  verify2FA: RequestHandler;
  getMe: RequestHandler;
  registerPushToken: RequestHandler;
} = {
  registerHospital: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const result = await authService.registerHospital(data);
    return sendSuccess(res, 'Hospital registered successfully', result, 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    let tenantDb = req.tenantDb as Connection;

    // If tenant middleware didn't resolve the DB (e.g. login from root domain),
    // fall back to resolving by admin email from the main DB.
    if (!tenantDb) {
      const tenant = await TenantModel.findOne({ adminEmail: email });
      if (tenant) {
        tenantDb = mongoose.connection.useDb(tenant.database.name, { useCache: true });
      } else {
        tenantDb = mongoose.connection;
      }
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    const result = await authService.login({ email, password }, tenantDb, ip, device);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    return sendSuccess(res, 'Login successful', result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    const result = await authService.refreshAccessToken(refreshToken, tenantDb, ip, device);

    res.cookie('refreshToken', result.newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 'Token refreshed', { accessToken: result.accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;

    if (refreshToken) {
      await authService.logout(refreshToken, tenantDb);
    }

    res.clearCookie('refreshToken');
    return sendSuccess(res, 'Logged out successfully');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email, tenantSlug } = req.body;
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;

    await authService.forgotPassword(email, tenantDb, tenantSlug);
    // Always return success to prevent email enumeration
    return sendSuccess(res, 'If an account exists, a reset link has been sent');
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;

    await authService.resetPassword(token, newPassword, tenantDb);
    return sendSuccess(res, 'Password reset successfully');
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;

    await authService.verifyEmail(token, tenantDb);
    return sendSuccess(res, 'Email verified successfully');
  }),

  setup2FA: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    const tenantDb = req.tenantDb as Connection;

    const result = await authService.setup2FA(req.user.userId, tenantDb);
    return sendSuccess(res, '2FA setup initialized', result);
  }),

  enable2FA: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    const { totpCode } = req.body;
    const tenantDb = req.tenantDb as Connection;

    await authService.enable2FA(req.user.userId, tenantDb, totpCode);
    return sendSuccess(res, '2FA enabled successfully');
  }),

  verify2FA: asyncHandler(async (req: Request, res: Response) => {
    const { userId, totpCode } = req.body;
    const tenantDb = req.tenantDb as Connection;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    const result = await authService.verify2FA(userId, tenantDb, totpCode, ip, device);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    return sendSuccess(res, '2FA verified successfully', result);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;

    const user = await authService.getCurrentUser(req.user.userId, tenantDb);
    return sendSuccess(res, 'User profile fetched', user);
  }),

  registerPushToken: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    const tenantDb = (req.tenantDb as Connection) || mongoose.connection;
    const { token, platform } = req.body;

    const PushToken = getPushTokenModel(tenantDb);
    await PushToken.findOneAndUpdate(
      { userId: req.user.userId, token },
      { tenantId: tenantDb.name, platform },
      { upsert: true, new: true }
    );

    return sendSuccess(res, 'Push token registered successfully');
  }),
};
