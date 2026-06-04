"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAMES = exports.NOTIFICATION_EXPIRY_DAYS = exports.NOTIFICATION_PAGE_SIZE = exports.APPOINTMENT_REMINDER_HOURS = exports.APPOINTMENT_SLOT_DURATION_MINUTES = exports.RATE_LIMIT = exports.CACHE_TTL = exports.ALLOWED_DOCUMENT_TYPES = exports.ALLOWED_IMAGE_TYPES = exports.MAX_FILE_SIZE_BYTES = exports.MAX_FILE_SIZE_MB = exports.UHID_PADDING = exports.UHID_PREFIX = exports.TENANT_DB_PREFIX = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.PASSWORD_RESET_EXPIRY_MINUTES = exports.OTP_EXPIRY_MINUTES = exports.LOCKOUT_DURATION_MINUTES = exports.MAX_LOGIN_ATTEMPTS = exports.SALT_ROUNDS = exports.API_PREFIX = exports.APP_VERSION = exports.APP_NAME = void 0;
// ─── Application Info ───────────────────────────────────────────────────────
exports.APP_NAME = 'MedicaLink HMS';
exports.APP_VERSION = '1.0.0';
exports.API_PREFIX = '/api/v1';
// ─── Auth ────────────────────────────────────────────────────────────────────
exports.SALT_ROUNDS = 12;
exports.MAX_LOGIN_ATTEMPTS = 5;
exports.LOCKOUT_DURATION_MINUTES = 15;
exports.OTP_EXPIRY_MINUTES = 10;
exports.PASSWORD_RESET_EXPIRY_MINUTES = 30;
// ─── Pagination ───────────────────────────────────────────────────────────────
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
// ─── Tenant DB prefix ────────────────────────────────────────────────────────
exports.TENANT_DB_PREFIX = 'medicalink_';
// ─── UHID (Unique Hospital ID) ───────────────────────────────────────────────
exports.UHID_PREFIX = 'UHD';
exports.UHID_PADDING = 8; // e.g. UHD00000001
// ─── Upload Limits ───────────────────────────────────────────────────────────
exports.MAX_FILE_SIZE_MB = 10;
exports.MAX_FILE_SIZE_BYTES = exports.MAX_FILE_SIZE_MB * 1024 * 1024;
exports.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
exports.ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
];
// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
exports.CACHE_TTL = {
    USER_SESSION: 60 * 15, // 15 minutes
    TENANT_SETTINGS: 60 * 60, // 1 hour
    DOCTOR_SCHEDULE: 60 * 60, // 1 hour (invalidate on booking)
    DRUG_CATALOG: 60 * 60 * 4, // 4 hours
    ICD10_SEARCH: 60 * 60 * 24, // 24 hours
    ANALYTICS_DASHBOARD: 60 * 15, // 15 minutes
    PATIENT_BASIC: 60 * 30, // 30 minutes
    AI_RESPONSE: 60 * 60, // 1 hour (same input = same cached output)
};
// ─── Rate Limits ──────────────────────────────────────────────────────────────
exports.RATE_LIMIT = {
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests / 15 min
    PUBLIC: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests / 15 min
    AUTHENTICATED: { windowMs: 60 * 1000, max: 300 }, // 300 requests / min
    AI: { windowMs: 60 * 1000, max: 20 }, // 20 requests / min
    REPORTS: { windowMs: 60 * 1000, max: 5 }, // 5 requests / min
    UPLOADS: { windowMs: 60 * 1000, max: 10 }, // 10 requests / min
};
// ─── Appointment ─────────────────────────────────────────────────────────────
exports.APPOINTMENT_SLOT_DURATION_MINUTES = 15;
exports.APPOINTMENT_REMINDER_HOURS = [24, 1]; // send reminders at 24h and 1h before
// ─── Notification ────────────────────────────────────────────────────────────
exports.NOTIFICATION_PAGE_SIZE = 20;
exports.NOTIFICATION_EXPIRY_DAYS = 90;
// ─── Queue Names ─────────────────────────────────────────────────────────────
exports.QUEUE_NAMES = {
    EMAIL: 'email-queue',
    SMS: 'sms-queue',
    PUSH: 'push-queue',
    REPORT_GENERATION: 'report-generation-queue',
    PHARMACY_REORDER: 'pharmacy-reorder-queue',
    LAB_NOTIFICATIONS: 'lab-notification-queue',
};
