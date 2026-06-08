import { z } from 'zod';
import { Role } from '@medicalink/shared';

// Helper to validate MongoDB ObjectId
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).trim().toUpperCase(),
  description: z.string().optional(),
  headDoctor: objectIdSchema.optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createWardSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).trim().toUpperCase(),
  type: z.enum(['GENERAL', 'ICU', 'EMERGENCY', 'MATERNITY']),
  departmentId: objectIdSchema.or(z.literal('')).optional(),
});

export const updateWardSchema = createWardSchema.partial();

export const createBedSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required').trim().toUpperCase(),
  wardId: objectIdSchema,
  type: z.enum(['STANDARD', 'ICU', 'HDU', 'ISOLATION', 'PEDIATRIC']).default('STANDARD'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
  features: z.array(z.string()).optional(),
});

export const updateBedSchema = createBedSchema.partial();

export const generateBedsSchema = z.object({
  wardId: objectIdSchema,
  count: z.number().min(1).max(100),
  prefix: z.string().optional(),
  type: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  role: z.nativeEnum(Role),
  departmentId: objectIdSchema.or(z.literal('')).optional(),
  phone: z.string().optional(),
  dob: z.string().or(z.date()).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  staffId: z.string().optional(),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  joinDate: z.string().or(z.date()).optional(),
  specialization: z.string().optional(),
  registrationNumber: z.string().optional(),
  degree: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
});

export const updateUserSchema = createUserSchema.partial();
