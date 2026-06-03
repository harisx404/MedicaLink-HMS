import crypto from 'crypto';
import { UHID_PREFIX, UHID_PADDING } from './constants';

/**
 * Generates a unique hospital ID (UHID) for a new patient.
 * Format: UHD00000001, UHD00000002, ...
 *
 * @param sequenceNumber - The next available sequence number
 */
export function generateUHID(sequenceNumber: number): string {
  return `${UHID_PREFIX}${String(sequenceNumber).padStart(UHID_PADDING, '0')}`;
}

/**
 * Generates a sequential document number with a prefix and zero-padded digits.
 * Example: generateDocNumber('BILL', 1234) → 'BILL-0001234'
 */
export function generateDocNumber(prefix: string, sequence: number, padding = 7): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(padding, '0')}`;
}

/**
 * Generates a cryptographically secure random token (hex string).
 * Used for password reset tokens, email verification, etc.
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a numeric OTP of the given length.
 */
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i]! % 10];
  }
  return otp;
}

/**
 * Extracts the tenant slug from the request Host header.
 * In production: "citygeneral.medicalink.app" → "citygeneral"
 * In development: uses the "X-Tenant-Slug" header as fallback.
 */
export function extractTenantSlug(host: string | undefined, tenantHeader?: string): string | null {
  if (tenantHeader) return tenantHeader.toLowerCase().trim();
  if (!host) return null;

  // Strip port if present
  const hostname = host.split(':')[0]!;
  const parts = hostname.split('.');

  // Must be at least: subdomain.medicalink.app (3 parts)
  if (parts.length >= 3) {
    return parts[0]!.toLowerCase();
  }

  return null;
}

/**
 * Builds a paginated MongoDB query from request query parameters.
 */
export function parsePaginationParams(
  query: Record<string, unknown>,
  defaultLimit = 20,
  maxLimit = 100
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query['page']) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query['limit']) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Strips undefined and null fields from an object (for clean MongoDB $set operations).
 */
export function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}

/**
 * Slugify a string: "City General Hospital" → "city-general-hospital"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Masks sensitive strings for logging: "secret123" → "sec***123"
 */
export function maskSensitive(value: string, visibleChars = 3): string {
  if (value.length <= visibleChars * 2) return '***';
  return `${value.slice(0, visibleChars)}${'*'.repeat(value.length - visibleChars * 2)}${value.slice(-visibleChars)}`;
}
