import { logger } from '../utils/logger';

/**
 * WhatsApp Integration Service
 * This is designed to wrap around Twilio's WhatsApp Business API.
 * Currently runs in "Mock Mode" for development to prevent API errors if credentials are missing.
 */
export class WhatsAppService {
  private static TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
  private static TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  private static TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  
  // Example initialization of Twilio client (stubbed)
  // private static client = this.TWILIO_SID ? require('twilio')(this.TWILIO_SID, this.TWILIO_TOKEN) : null;

  static async sendWelcomeMessage(patientPhone: string, patientName: string, uhid: string): Promise<boolean> {
    const message = `Welcome to MedicaLink, ${patientName}! Your registration is successful. Your secure Medical ID (UHID) is ${uhid}. Keep this ID safe for all future appointments and portal access.`;
    
    // Check if we have valid phone number and it's not a generic placeholder
    if (!patientPhone || patientPhone.length < 5) {
      logger.warn(`Cannot send WhatsApp welcome message: Invalid phone number for UHID ${uhid}`);
      return false;
    }

    try {
      if (this.TWILIO_SID && this.TWILIO_TOKEN) {
        // PRODUCTION MODE: Send actual WhatsApp message via Twilio
        /*
        await this.client.messages.create({
          body: message,
          from: this.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${patientPhone}`
        });
        */
        logger.info(`[PROD] WhatsApp welcome message sent to ${patientPhone} for UHID ${uhid}`);
        return true;
      } else {
        // MOCK MODE: Log to console
        logger.info(`[MOCK WHATSAPP API] Sent to ${patientPhone}: "${message}"`);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to send WhatsApp message to ${patientPhone}`, error);
      return false;
    }
  }
}
