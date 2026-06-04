import { z } from 'zod';
import { TenantPlan } from '@medicalink/shared';

// -- Helpers --
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[\W_]/, 'Password must contain at least one special character');

// -- Schemas --

export const registerHospitalSchema = z.object({
  body: z.object({
    hospitalName: z.string().min(2, 'Hospital name must be at least 2 characters').trim(),
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .trim(),
    adminEmail: z.string().email('Invalid email address').toLowerCase().trim(),
    password: passwordSchema,
    plan: z.nativeEnum(TenantPlan).default(TenantPlan.FREE),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    tenantSlug: z.string().min(1, 'Tenant slug is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: passwordSchema,
  }),
});

export const enable2FASchema = z.object({
  body: z.object({
    totpCode: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
  }),
});

export const verify2FASchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    totpCode: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
  }),
});

export const refreshSchema = z.object({
  // The token could be in a cookie or the body. In our case, we will look for it in cookies in the controller.
  // But if passed via body for mobile apps, it's valid too.
  body: z.object({
    refreshToken: z.string().optional(),
  }),
  cookies: z.object({
    refreshToken: z.string().optional(),
  }).optional(),
}).refine(data => data.body.refreshToken || data.cookies?.refreshToken, {
  message: 'Refresh token is required',
  path: ['body', 'refreshToken'],
});
