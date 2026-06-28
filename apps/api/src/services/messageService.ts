import mongoose from 'mongoose';
import { SendMessagePayload } from '@medicalink/shared';
import { getMessageModel } from '../models/Message';
import { emitToUser } from '../sockets';
import { logger } from '../utils/logger';

export class MessageService {
  /**
   * Send a direct message to another staff member
   */
  static async sendMessage(tenantDb: mongoose.Connection, tenantId: string, senderId: string, payload: SendMessagePayload) {
    const { receiverId, content, attachments } = payload;
    const Message = getMessageModel(tenantDb);

    const message = await Message.create({
      tenantId,
      senderId,
      receiverId,
      content,
      attachments
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'firstName lastName avatar designation')
      .lean();

    // Emit via WebSocket to receiver
    try {
      emitToUser(receiverId, 'NEW_MESSAGE', populatedMessage);
    } catch (error) {
      logger.error(`[MessageService] Socket emit failed for receiver ${receiverId}:`, error);
    }

    return populatedMessage;
  }

  /**
   * Mark messages as read for a specific conversation
   */
  static async markConversationAsRead(tenantDb: mongoose.Connection, tenantId: string, userId: string, senderId: string) {
    const Message = getMessageModel(tenantDb);
    
    await Message.updateMany(
      {
        tenantId,
        receiverId: userId,
        senderId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );
  }
}
