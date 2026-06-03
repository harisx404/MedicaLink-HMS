// ─── Application Info ───────────────────────────────────────────────────────
export const APP_NAME = 'MedicaLink HMS';
export const APP_VERSION = '1.0.0';
export const API_PREFIX = '/api/v1';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const SALT_ROUNDS = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
export const OTP_EXPIRY_MINUTES = 10;
export const PASSWORD_RESET_EXPIRY_MINUTES = 30;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Tenant DB prefix ────────────────────────────────────────────────────────
export const TENANT_DB_PREFIX = 'medicalink_';

// ─── UHID (Unique Hospital ID) ───────────────────────────────────────────────
export const UHID_PREFIX = 'UHD';
export const UHID_PADDING = 8; // e.g. UHD00000001

// ─── Upload Limits ───────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
export const CACHE_TTL = {
  USER_SESSION: 60 * 15,           // 15 minutes
  TENANT_SETTINGS: 60 * 60,        // 1 hour
  DOCTOR_SCHEDULE: 60 * 60,        // 1 hour (invalidate on booking)
  DRUG_CATALOG: 60 * 60 * 4,       // 4 hours
  ICD10_SEARCH: 60 * 60 * 24,      // 24 hours
  ANALYTICS_DASHBOARD: 60 * 15,    // 15 minutes
  PATIENT_BASIC: 60 * 30,          // 30 minutes
  AI_RESPONSE: 60 * 60,            // 1 hour (same input = same cached output)
} as const;

// ─── Rate Limits ──────────────────────────────────────────────────────────────
export const RATE_LIMIT = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 },          // 5 requests / 15 min
  PUBLIC: { windowMs: 15 * 60 * 1000, max: 100 },       // 100 requests / 15 min
  AUTHENTICATED: { windowMs: 60 * 1000, max: 300 },     // 300 requests / min
  AI: { windowMs: 60 * 1000, max: 20 },                 // 20 requests / min
  REPORTS: { windowMs: 60 * 1000, max: 5 },             // 5 requests / min
  UPLOADS: { windowMs: 60 * 1000, max: 10 },            // 10 requests / min
} as const;

// ─── Appointment ─────────────────────────────────────────────────────────────
export const APPOINTMENT_SLOT_DURATION_MINUTES = 15;
export const APPOINTMENT_REMINDER_HOURS = [24, 1]; // send reminders at 24h and 1h before

// ─── Notification ────────────────────────────────────────────────────────────
export const NOTIFICATION_PAGE_SIZE = 20;
export const NOTIFICATION_EXPIRY_DAYS = 90;

// ─── Queue Names ─────────────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  SMS: 'sms-queue',
  PUSH: 'push-queue',
  REPORT_GENERATION: 'report-generation-queue',
  PHARMACY_REORDER: 'pharmacy-reorder-queue',
  LAB_NOTIFICATIONS: 'lab-notification-queue',
} as const;
