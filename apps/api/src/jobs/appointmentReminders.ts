import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { Tenant } from '../models/Tenant';
import { getTenantDb } from '../config/db';
import { getAppointmentModel } from '../models/Appointment';
import { getPatientModel } from '../models/Patient';

// import { sendEmail } from '../utils/email';

const sendEmail = async (to: string, subject: string, html: string) => {
  console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject} | HTML: ${html.substring(0, 10)}...`);
};
import twilio from 'twilio';

// Use redis instance from config
const connection = getRedisClient();

export const appointmentQueue = new Queue('appointment-reminders', { 
  connection: connection as never 
});

const sendSMS = async (to: string, body: string) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS MOCK] To: ${to} | Body: ${body}`);
    return;
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
};

export const appointmentWorker = new Worker('appointment-reminders', async (job: Job) => {
  const { appointmentId, tenantId, type } = job.data;
  
  try {
    const tenant = await Tenant.findOne({ slug: tenantId }); // Using tenantId as slug for now or we need id
    if (!tenant) throw new Error('Tenant not found');

    const tenantDb = await getTenantDb(tenant.slug);
    const Appointment = getAppointmentModel(tenantDb);
    const Patient = getPatientModel(tenantDb);

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'userId' }});

    if (!appointment || appointment.status === 'CANCELLED') {
      return; // Appointment cancelled or doesn't exist
    }

    const patient = appointment.patient as unknown as Record<string, unknown>;
    const doctorUser = (appointment.doctor as unknown as Record<string, unknown>)?.userId as Record<string, unknown>;

    const timeStr = appointment.timeSlot.start;
    const docName = `Dr. ${doctorUser?.firstName} ${doctorUser?.lastName}`;
    
    const message = `Reminder: Your appointment with ${docName} is at ${timeStr} today. Token: ${appointment.tokenNumber}. ${tenant.name}`;

    // SMS
    if (patient.phone) {
      await sendSMS(patient.phone as string, message);
    }

    // Email
    if (patient.email) {
      await sendEmail(
        patient.email as string,
        'Appointment Reminder',
        `<p>${message}</p>`
      );
    }

    // Mark reminder as sent
    appointment.reminders.push({
      type,
      sentAt: new Date(),
      status: 'SENT'
    });
    await appointment.save();

  } catch (error) {
    console.error(`Error processing reminder job ${job.id}:`, error);
    throw error;
  }
}, { connection: connection as never });
