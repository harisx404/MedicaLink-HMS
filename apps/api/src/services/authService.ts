import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import mongoose, { Connection } from 'mongoose';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';
import { TenantStatus, SharedTenant, AuthUser, LoginRequest, RegisterHospitalRequest } from '@medicalink/shared';
import { Tenant as TenantModel } from '../models/Tenant';
import { getUserModel } from '../models/User';
import { emailService } from './emailService';
import { auditService } from './auditService';
import { getRedisClient } from '../config/redis';
import { getTenantDb } from '../config/db';
import { TENANT_DB_PREFIX, CACHE_TTL, APP_NAME } from '../utils/constants';

// ---- Private Helpers ----

const generateAccessToken = (payload: { userId: string; role: string; tenantId: string; tenantSlug: string }): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const authService = {
  /**
   * Register a new hospital (tenant).
   * Creates the tenant in main DB, sets up their DB connection string,
   * creates the super admin / hospital admin user, and sends a welcome email.
   */
  async registerHospital(data: RegisterHospitalRequest): Promise<{ tenant: SharedTenant; adminUser: AuthUser }> {
    // Check if slug exists
    const existing = await TenantModel.findOne({ slug: data.slug });
    if (existing) {
      throw new AppError('Tenant slug already in use', 409);
    }

    const dbName = `${TENANT_DB_PREFIX}${data.slug}`;

    const tenant = await TenantModel.create({
      name: data.hospitalName,
      slug: data.slug,
      plan: data.plan,
      status: TenantStatus.ACTIVE,
      adminEmail: data.adminEmail,
      database: {
        name: dbName,
        // connectionString can be generated if needed, else we use the main MONGO_URI and switch DB
      },
    });

    // We need to connect to the new DB and create the Admin user
    // Since we manage multi-tenancy by switching DBs on the same connection, we can get a connection
    // from mongoose.connection.useDb
    const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
    
    const User = getUserModel(tenantDb);

    const adminUser = await User.create({
      tenantId: tenant._id.toString(),
      email: data.adminEmail,
      password: data.password, // hashed via pre-save
      role: 'HOSPITAL_ADMIN',
      firstName: 'Hospital',
      lastName: 'Admin',
      isActive: true,
      isEmailVerified: true, // Auto-verified for admins created by system
    });

    const loginUrl = `${env.CLIENT_URL}/login?tenant=${data.slug}`;
    await emailService.sendWelcomeEmail(data.adminEmail, data.hospitalName, loginUrl);

    await auditService.logAuthEvent('TENANT_CREATED', {
      actor: 'system',
      resource: 'Tenant',
      resourceId: tenant._id.toString(),
      details: { slug: data.slug },
    });

    return {
      tenant: tenant.toJSON() as unknown as SharedTenant,
      adminUser: {
        id: adminUser._id.toString(),
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt.toISOString(),
      },
    };
  },

  async login(
    data: LoginRequest,
    tenantDb: Connection,
    ip: string,
    device: string
  ): Promise<{ user: AuthUser; accessToken?: string; refreshToken?: string; requires2FA?: boolean }> {
    const User = getUserModel(tenantDb);
    console.log('[DEBUG authService] Checking user:', data.email);
    const user = await User.findOne({ email: data.email }).select('+password +twoFactorSecret').exec();

    if (!user) {
      console.log('[DEBUG authService] User not found');
      await auditService.logAuthEvent('AUTH_FAILED_LOGIN', {
        actor: 'unknown',
        actorEmail: data.email,
        resource: 'User',
        ip,
        userAgent: device,
        details: { reason: 'User not found' },
      });
      throw new AppError('Invalid email or password', 401);
    }

    if (user.isLocked()) {
      throw new AppError('Account is locked. Please try again later.', 403);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact support.', 403);
    }

    const isValid = await user.comparePassword(data.password || '');
    console.log('[DEBUG authService] Password is valid?', isValid);
    if (!isValid) {
      await user.incrementLoginAttempts();
      await auditService.logAuthEvent('AUTH_FAILED_LOGIN', {
        actor: user._id.toString(),
        actorEmail: user.email,
        tenantId: user.tenantId,
        resource: 'User',
        resourceId: user._id.toString(),
        ip,
        userAgent: device,
        details: { reason: 'Invalid password' },
      });
      throw new AppError('Invalid email or password', 401);
    }

    await user.resetLoginAttempts();

    const authUser: AuthUser = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      departmentId: user.department?.toString(),
      isActive: user.isActive,
      profileImage: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };

    if (user.twoFactorEnabled) {
      return { user: authUser, requires2FA: true };
    }

    // Generate tokens
    const tenant = await TenantModel.findById(user.tenantId);
    const tenantSlug = tenant ? tenant.slug : 'master';
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug,
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    // Save refresh token to user
    user.refreshTokens.push({
      tokenHash,
      device,
      ip,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    user.lastLogin = new Date();
    await user.save();

    // Store session in Redis
    const redis = getRedisClient();
    await redis.setex(
      `auth:refresh:${tokenHash}`,
      CACHE_TTL.USER_SESSION,
      JSON.stringify({ userId: user._id, tenantId: user.tenantId, device })
    );

    await auditService.logAuthEvent('AUTH_LOGIN', {
      actor: user._id.toString(),
      actorEmail: user.email,
      tenantId: user.tenantId,
      resource: 'User',
      resourceId: user._id.toString(),
      ip,
      userAgent: device,
    });

    return {
      user: authUser,
      accessToken,
      refreshToken,
    };
  },

  async refreshAccessToken(
    refreshToken: string,
    tenantDb: Connection,
    ip: string,
    device: string
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const tokenHash = hashToken(refreshToken);
    
    // Check blacklist
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`auth:blacklist:${tokenHash}`);
    if (isBlacklisted) {
      throw new AppError('Invalid token', 401);
    }

    const User = getUserModel(tenantDb);
    let user = await User.findOne({ 'refreshTokens.tokenHash': tokenHash });

    if (!user) {
      if (tenantDb !== mongoose.connection) {
        const MainUser = getUserModel(mongoose.connection);
        user = await MainUser.findOne({ 'refreshTokens.tokenHash': tokenHash });
      } else {
        const sessionData = await redis.get(`auth:refresh:${tokenHash}`);
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            if (session.tenantId && session.tenantId !== '000000000000000000000000') {
              const tenant = await TenantModel.findById(session.tenantId);
              if (tenant) {
                const targetDb = await getTenantDb(tenant.slug);
                const TenantUser = getUserModel(targetDb);
                user = await TenantUser.findOne({ 'refreshTokens.tokenHash': tokenHash });
              }
            }
          } catch {
            // Ignore error
          }
        }

        if (!user) {
          const tenants = await TenantModel.find({ status: 'ACTIVE' });
          for (const tenant of tenants) {
            try {
              const targetDb = await getTenantDb(tenant.slug);
              const TenantUser = getUserModel(targetDb);
              const foundUser = await TenantUser.findOne({ 'refreshTokens.tokenHash': tokenHash });
              if (foundUser) {
                user = foundUser;
                break;
              }
            } catch {
              // Ignore connection errors
            }
          }
        }
      }
    }

    if (!user || !user.isActive) {
      throw new AppError('Invalid token', 401);
    }

    const tokenRecord = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Token expired', 401);
    }

    // Generate new tokens
    const tenant = await TenantModel.findById(user.tenantId);
    const tenantSlug = tenant ? tenant.slug : 'master';
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug,
    });
    const newRefreshToken = generateRefreshToken();
    const newHash = hashToken(newRefreshToken);

    // Rotate token
    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
    user.refreshTokens.push({
      tokenHash: newHash,
      device,
      ip,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    // Invalidate old token in Redis, store new
    await redis.setex(`auth:blacklist:${tokenHash}`, 60 * 60 * 24 * 30, '1'); // blacklist for 30 days
    await redis.del(`auth:refresh:${tokenHash}`);
    
    await redis.setex(
      `auth:refresh:${newHash}`,
      CACHE_TTL.USER_SESSION,
      JSON.stringify({ userId: user._id, tenantId: user.tenantId, device })
    );

    return { accessToken, newRefreshToken };
  },

  async logout(refreshToken: string, tenantDb: Connection): Promise<void> {
    if (!refreshToken) return;
    
    const tokenHash = hashToken(refreshToken);
    const User = getUserModel(tenantDb);
    
    // Remove from DB
    await User.updateOne(
      { 'refreshTokens.tokenHash': tokenHash },
      { $pull: { refreshTokens: { tokenHash } } }
    );

    // Blacklist in Redis
    const redis = getRedisClient();
    await redis.setex(`auth:blacklist:${tokenHash}`, 60 * 60 * 24 * 30, '1');
    await redis.del(`auth:refresh:${tokenHash}`);

    const user = await User.findOne({ 'refreshTokens.tokenHash': tokenHash });
    if (user) {
      await auditService.logAuthEvent('AUTH_LOGOUT', {
        actor: user._id.toString(),
        resource: 'User',
        resourceId: user._id.toString(),
        tenantId: user.tenantId,
      });
    }
  },

  async setup2FA(userId: string, tenantDb: Connection): Promise<{ secret: string; qrCodeUrl: string }> {
    const User = getUserModel(tenantDb);
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    // Don't enable until verified
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return { secret: secret.base32, qrCodeUrl };
  },

  async enable2FA(userId: string, tenantDb: Connection, totpCode: string): Promise<void> {
    const User = getUserModel(tenantDb);
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) throw new AppError('User or 2FA secret not found', 404);

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: totpCode,
    });

    if (!isValid) throw new AppError('Invalid 2FA code', 400);

    user.twoFactorEnabled = true;
    await user.save();

    await auditService.logAuthEvent('AUTH_2FA_ENABLED', {
      actor: user._id.toString(),
      resource: 'User',
      resourceId: user._id.toString(),
      tenantId: user.tenantId,
    });
  },

  async verify2FA(
    userId: string,
    tenantDb: Connection,
    totpCode: string,
    ip: string,
    device: string
  ): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const User = getUserModel(tenantDb);
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError('2FA is not enabled for this user', 400);
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: totpCode,
    });

    if (!isValid) throw new AppError('Invalid 2FA code', 401);

    const authUser: AuthUser = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      departmentId: user.department?.toString(),
      isActive: user.isActive,
      profileImage: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };

    const tenant = await TenantModel.findById(user.tenantId);
    const tenantSlug = tenant ? tenant.slug : 'master';
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug,
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    user.refreshTokens.push({
      tokenHash,
      device,
      ip,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    user.lastLogin = new Date();
    await user.save();

    const redis = getRedisClient();
    await redis.setex(
      `auth:refresh:${tokenHash}`,
      CACHE_TTL.USER_SESSION,
      JSON.stringify({ userId: user._id, tenantId: user.tenantId, device })
    );

    return { user: authUser, accessToken, refreshToken };
  },

  async forgotPassword(email: string, tenantDb: Connection, tenantSlug: string): Promise<void> {
    const User = getUserModel(tenantDb);
    const user = await User.findOne({ email });
    if (!user) return; // Silent return for security

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = hashToken(resetToken);

    user.passwordResetToken = resetHash;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

    const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}?tenant=${tenantSlug}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl, '30 minutes');

    await auditService.logAuthEvent('AUTH_PASSWORD_RESET_REQUESTED', {
      actor: user._id.toString(),
      actorEmail: user.email,
      resource: 'User',
      resourceId: user._id.toString(),
      tenantId: user.tenantId,
    });
  },

  async resetPassword(token: string, newPassword: string, tenantDb: Connection): Promise<void> {
    const resetHash = hashToken(token);
    const User = getUserModel(tenantDb);
    
    const user = await User.findOne({
      passwordResetToken: resetHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) throw new AppError('Token is invalid or has expired', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Remove all refresh tokens to force re-login on all devices
    user.refreshTokens = [];
    await user.save();

    await auditService.logAuthEvent('AUTH_PASSWORD_RESET', {
      actor: user._id.toString(),
      actorEmail: user.email,
      resource: 'User',
      resourceId: user._id.toString(),
      tenantId: user.tenantId,
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verifyEmail(_token: string, _tenantDb: Connection): Promise<void> {
    // Similar to reset password but for email verification... (omitted for brevity, assume simple)
    throw new AppError('Not implemented', 501);
  },

  async getCurrentUser(userId: string, tenantDb: Connection): Promise<AuthUser> {
    const User = getUserModel(tenantDb);
    const user = await User.findById(userId);
    if (!user || !user.isActive) throw new AppError('User not found or inactive', 404);

    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      departmentId: user.department?.toString(),
      isActive: user.isActive,
      profileImage: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };
  }
};
