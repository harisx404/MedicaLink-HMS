import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { Tenant } from '../models/Tenant';
import { getTenantDb } from '../config/db';
import { getAppointmentModel } from '../models/Appointment';
import { getPatientModel } from '../models/Patient';

// Use redis instance from config
const connection = getRedisClient();

export const appointmentQueue = new Queue('appointment-reminders', {
  connection: connection as never,
});

const sendEmailNotification = async (to: string, subject: string, html: string): Promise<void> => {
  // TODO(Phase-18): Wire up SMTP via emailService when notification hub is implemented.
  // For now, this is a no-op placeholder that logs at debug level only.
  logger.debug(`[Email] To: ${to} | Subject: ${subject} | Preview: ${html.substring(0, 40)}...`);
};

const sendSmsNotification = async (to: string, body: string): Promise<void> => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    logger.debug(`[SMS] To: ${to} | Body: ${body}`);
    return;
  }

  // Lazy-load twilio only when credentials are present to avoid startup overhead
  const twilio = await import('twilio');
  const client = twilio.default(sid, token);
  await client.messages.create({ body, from, to });
};

export const appointmentWorker = new Worker(
  'appointment-reminders',
  async (job: Job) => {
    const { appointmentId, tenantId, type } = job.data as {
      appointmentId: string;
      tenantId: string;
      type: string;
    };

    const tenant = await Tenant.findOne({ slug: tenantId });
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const tenantDb = await getTenantDb(tenant.slug);
    const Appointment = getAppointmentModel(tenantDb);
    getPatientModel(tenantDb); // Register model for populate

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'userId' } });

    if (!appointment || appointment.status === 'CANCELLED') return;

    const patient = appointment.patient as unknown as Record<string, unknown>;
    const doctorUser = (appointment.doctor as unknown as Record<string, unknown>)
      ?.userId as Record<string, unknown>;

    const timeStr = appointment.timeSlot.start;
    const docName = `Dr. ${doctorUser?.firstName} ${doctorUser?.lastName}`;
    const message = `Reminder: Your appointment with ${docName} is at ${timeStr} today. Token: ${appointment.tokenNumber}. ${tenant.name}`;

    if (patient.phone) {
      await sendSmsNotification(patient.phone as string, message);
    }

    if (patient.email) {
      await sendEmailNotification(
        patient.email as string,
        'Appointment Reminder',
        `<p>${message}</p>`
      );
    }

    appointment.reminders.push({ type, sentAt: new Date(), status: 'SENT' });
    await appointment.save();
  },
  { connection: connection as never }
);

appointmentWorker.on('failed', (job, err) => {
  logger.error(`Appointment reminder job ${job?.id} failed:`, err);
});
