import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Only create transporter if SMTP settings are provided
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

/**
 * Send an email using Nodemailer.
 * In development, if SMTP is not configured, it just logs the email.
 */
const sendMail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    logger.info(`[EmailService] Mock sending email to ${to}`);
    logger.info(`[EmailService] Subject: ${subject}`);
    logger.debug(`[EmailService] HTML: ${html}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`[EmailService] Email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`[EmailService] Failed to send email to ${to}:`, error);
    throw error;
  }
};

export const emailService = {
  async sendWelcomeEmail(to: string, hospitalName: string, loginUrl: string): Promise<void> {
    const subject = `Welcome to ${hospitalName} on MedicaLink HMS`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to ${hospitalName}!</h2>
        <p>Your hospital account has been successfully created on MedicaLink HMS.</p>
        <p>You can access your admin portal here:</p>
        <p><a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Portal</a></p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The MedicaLink Team</p>
      </div>
    `;
    await sendMail(to, subject, html);
  },

  async sendPasswordResetEmail(to: string, resetUrl: string, expiresIn: string): Promise<void> {
    const subject = 'Reset Your MedicaLink Password';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in ${expiresIn}.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
    await sendMail(to, subject, html);
  },

  async sendEmailVerification(to: string, verifyUrl: string): Promise<void> {
    const subject = 'Verify Your Email Address - MedicaLink HMS';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Verify Your Email</h2>
        <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
        <p><a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      </div>
    `;
    await sendMail(to, subject, html);
  },
};
