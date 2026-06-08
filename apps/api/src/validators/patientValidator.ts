import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Pincode is required'),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Emergency contact phone is required'),
  address: z.string().optional(),
});

const allergySchema = z.object({
  allergen: z.string().min(1, 'Allergen is required'),
  type: z.string().min(1, 'Allergy type is required'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  reaction: z.string().min(1, 'Reaction is required'),
});

const chronicConditionSchema = z.object({
  condition: z.string().min(1, 'Condition is required'),
  icdCode: z.string().optional(),
  diagnosedDate: z.string().datetime().optional().or(z.date().optional()),
  status: z.enum(['ACTIVE', 'RESOLVED', 'MANAGED']),
});

const currentMedicationSchema = z.object({
  drug: z.string().min(1, 'Drug name is required'),
  dose: z.string().min(1, 'Dose is required'),
  frequency: z.string().min(1, 'Frequency is required'),
});

const immunizationSchema = z.object({
  vaccine: z.string().min(1, 'Vaccine name is required'),
  date: z.string().datetime().or(z.date()),
  nextDue: z.string().datetime().optional().or(z.date().optional()),
  batchNumber: z.string().optional(),
});

const insuranceSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  memberName: z.string().min(1, 'Member name is required'),
  validFrom: z.string().datetime().or(z.date()),
  validTo: z.string().datetime().or(z.date()),
  cardImage: z.string().url().optional().or(z.literal('')),
  preauthRequired: z.boolean().default(false),
  tpaName: z.string().optional(),
});

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    middleName: z.string().trim().optional(),
    dateOfBirth: z.string().datetime().or(z.date()),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']).default('UNKNOWN'),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER']).default('SINGLE'),
    religion: z.string().trim().optional(),
    nationality: z.string().min(1, 'Nationality is required').trim(),
    photo: z.string().url().optional().or(z.literal('')),
    
    phone: z.string().min(1, 'Phone is required').trim(),
    altPhone: z.string().trim().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: addressSchema,
    emergencyContact: emergencyContactSchema,
    
    allergies: z.array(allergySchema).optional(),
    chronicConditions: z.array(chronicConditionSchema).optional(),
    currentMedications: z.array(currentMedicationSchema).optional(),
    immunizations: z.array(immunizationSchema).optional(),
    insurances: z.array(insuranceSchema).optional(),
    
    registrationType: z.enum(['OPD', 'IPD', 'EMERGENCY']),
    referredBy: z.object({
      type: z.enum(['DOCTOR', 'HOSPITAL', 'SELF']),
      name: z.string().optional(),
    }).optional(),
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Patient ID'),
  }),
  body: createPatientSchema.shape.body.partial(),
});

export const getPatientByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Patient ID'),
  }),
});

export const searchPatientSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']).optional(),
    registrationType: z.enum(['OPD', 'IPD', 'EMERGENCY']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
