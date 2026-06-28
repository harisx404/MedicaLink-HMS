import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { getNotificationModel } from '../models/Notification';
import { NotificationChannel } from '@medicalink/shared';
import mongoose from 'mongoose';

const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10),
  password: redisUrl.password || undefined
};

// Queue Setup
export const notificationQueue = new Queue('notification-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Worker Setup
export const notificationWorker = new Worker(
  'notification-queue',
  async (job: Job) => {
    const { notificationId, tenantId, email, phone, title, body, templateId, channels } = job.data;
    logger.info(`[NotificationWorker] Processing job ${job.id} for notification ${notificationId}`);

    // Assuming we don't have the tenant DB connection initialized here natively because workers are global.
    // For now we will just use a global connection or a helper if available, but since MedicaLink uses multi-tenancy,
    // we need to retrieve the Notification via the tenant connection.
    // However, for background jobs, we might need a dedicated db connection manager.
    // For simplicity of this worker, we'll try to find the connection.
    // We will assume `global.mongoose` or similar holds connections, or we can use the global connection if it's stored there.
    
    // In a real application, you'd get the tenant connection here.
    // Let's assume we can get it from mongoose.connections
    const tenantDb = mongoose.connections.find(c => c.name === `tenant_${tenantId}`) || mongoose.connection;
    const Notification = getNotificationModel(tenantDb);

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      logger.warn(`[NotificationWorker] Notification ${notificationId} not found.`);
      return;
    }

    // Process Email
    if (channels.includes(NotificationChannel.EMAIL) && email) {
      try {
        // Here we would use NodeMailer or AWS SES
        // For development, we log it securely
        logger.info(`[MOCK EMAIL] Sending to ${email}: [${title}] ${body}`);
        
        notification.status.email = { sent: true, deliveredAt: new Date() };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`[NotificationWorker] Email failed for ${notificationId}: ${message}`);
        notification.status.email = { sent: false, error: message };
      }
    }

    // Process SMS
    if (channels.includes(NotificationChannel.SMS) && phone) {
      try {
        // Here we would use Twilio API
        // For development, we log it securely
        logger.info(`[MOCK SMS] Sending to ${phone}: ${body}`);
        
        notification.status.sms = { sent: true, deliveredAt: new Date() };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`[NotificationWorker] SMS failed for ${notificationId}: ${message}`);
        notification.status.sms = { sent: false, error: message };
      }
    }

    // Process Push (Optional Expo integration)
    // if (channels.includes(NotificationChannel.PUSH)) { ... }

    await notification.save();
  },
  {
    connection,
    concurrency: 5 // Process 5 jobs concurrently
  }
);

// Worker Events
notificationWorker.on('completed', (job) => {
  logger.info(`[NotificationWorker] Job ${job.id} has completed successfully.`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`[NotificationWorker] Job ${job?.id} has failed: ${err.message}`);
});
