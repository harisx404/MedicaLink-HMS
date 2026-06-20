import axios from 'axios';
import { Connection } from 'mongoose';
import { getPushTokenModel } from '../models/PushToken';
import { logger } from '../utils/logger';

export const expoPushService = {
  async sendPushNotification(
    userId: string,
    tenantDb: Connection,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    try {
      const PushToken = getPushTokenModel(tenantDb);
      const tokens = await PushToken.find({ userId });
      
      if (!tokens || tokens.length === 0) {
        logger.debug(`No push tokens found for user ${userId}`);
        return;
      }

      const messages = tokens.map(t => ({
        to: t.token,
        sound: 'default',
        title,
        body,
        data: data || {},
      }));

      // Group into batches of 100 as per Expo documentation
      const chunks = [];
      for (let i = 0; i < messages.length; i += 100) {
        chunks.push(messages.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          }
        });
      }

      logger.info(`Successfully sent ${messages.length} push notifications for user ${userId}`);
    } catch (error) {
      logger.error('Error sending push notification via Expo:', error);
    }
  }
};
