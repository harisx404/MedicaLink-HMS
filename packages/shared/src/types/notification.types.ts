export enum NotificationType {
  // Clinical
  LAB_RESULT_READY = 'LAB_RESULT_READY',
  CRITICAL_LAB_VALUE = 'CRITICAL_LAB_VALUE',
  PRESCRIPTION_READY = 'PRESCRIPTION_READY',
  BLOOD_REQUEST = 'BLOOD_REQUEST',
  // Appointments
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_REMINDER_24H = 'APPOINTMENT_REMINDER_24H',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  // Admin & HR
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  SHIFT_REMINDER = 'SHIFT_REMINDER',
  // Finance
  BILL_GENERATED = 'BILL_GENERATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  // System
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  // Custom
  CUSTOM = 'CUSTOM'
}

export enum NotificationCategory {
  CLINICAL = 'CLINICAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  BILLING = 'BILLING',
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationChannel {
  INAPP = 'INAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export interface SharedNotification {
  _id: string;
  tenantId: string;
  userId: string | Record<string, unknown>; // Populated User
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  status: {
    inApp?: { sent: boolean; readAt?: string | Date | null };
    email?: { sent: boolean; deliveredAt?: string | Date | null; error?: string };
    sms?: { sent: boolean; deliveredAt?: string | Date | null; error?: string };
  };
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | Date | null;
  expiresAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SharedNotificationTemplate {
  _id: string;
  tenantId: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SharedMessage {
  _id: string;
  tenantId: string;
  senderId: string | Record<string, unknown>; // Populated User
  receiverId: string | Record<string, unknown>; // Populated User
  content: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
  isRead: boolean;
  readAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Request & Response Types
export interface SendNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  data?: Record<string, unknown>;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
}
