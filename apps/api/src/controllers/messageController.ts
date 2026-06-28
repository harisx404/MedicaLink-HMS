import { Request, Response, RequestHandler } from 'express';
import { Types } from 'mongoose';
import { getMessageModel } from '../models/Message';
import { getUserModel } from '../models/User';
import { MessageService } from '../services/messageService';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

export const sendMessage: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const tenantDb = req.tenantDb!;
  
  const message = await MessageService.sendMessage(tenantDb, tenantId, userId, req.body);

  res.status(201).json({
    success: true,
    data: message
  });
});

export const getInbox: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const Message = getMessageModel(req.tenantDb!);

  // Get distinct conversations (latest message per user)
  // This uses aggregation to group messages by the "other" user
  const inbox = await Message.aggregate([
    {
      $match: {
        tenantId: new Types.ObjectId(tenantId),
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', new Types.ObjectId(userId)] },
            '$receiverId',
            '$senderId'
          ]
        },
        latestMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiverId', new Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'contact'
      }
    },
    {
      $unwind: '$contact'
    },
    {
      $project: {
        _id: 1,
        latestMessage: 1,
        unreadCount: 1,
        'contact._id': 1,
        'contact.firstName': 1,
        'contact.lastName': 1,
        'contact.avatar': 1,
        'contact.designation': 1,
        'contact.role': 1
      }
    },
    {
      $sort: { 'latestMessage.createdAt': -1 }
    }
  ]);

  res.json({
    success: true,
    data: inbox
  });
});

export const getConversation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const tenantDb = req.tenantDb!;
  const { otherUserId } = req.params;
  const Message = getMessageModel(tenantDb);
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  // Mark all unread messages from this user as read
  await MessageService.markConversationAsRead(tenantDb, tenantId, userId, otherUserId as string);

  const messages = await Message.find({
    tenantId,
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'firstName lastName avatar designation')
    .populate('receiverId', 'firstName lastName avatar designation')
    .lean();

  res.json({
    success: true,
    data: messages.reverse() // Reverse to send oldest first for chat UI
  });
});

export const searchStaff: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const User = getUserModel(req.tenantDb!);
  const query = req.query.q as string;

  if (!query || query.length < 2) {
    return res.json({ success: true, data: [] });
  }

  const staff = await User.find({
    tenantId,
    _id: { $ne: userId },
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  })
    .select('firstName lastName avatar designation role')
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: staff
  });
});
