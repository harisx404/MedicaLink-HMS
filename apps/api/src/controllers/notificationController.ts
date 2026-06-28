import { Request, Response, RequestHandler } from 'express';
import { Types } from 'mongoose';
import { getNotificationModel } from '../models/Notification';
import { getNotificationTemplateModel } from '../models/NotificationTemplate';
import { NotificationService } from '../services/notificationService';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

export const getNotifications: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const Notification = getNotificationModel(req.tenantDb!);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Filters
  const query: any = { tenantId, userId };
  
  if (req.query.category) query.category = req.query.category;
  if (req.query.isRead !== undefined) query.isRead = req.query.isRead === 'true';
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ tenantId, userId, isRead: false });

  res.json({
    success: true,
    data: notifications,
    meta: {
      unreadCount,
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

export const markAsRead: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const tenantDb = req.tenantDb!;
  const { notificationIds } = req.body; // Array of string IDs, optional

  await NotificationService.markAsRead(tenantDb, tenantId, userId, notificationIds);

  res.json({
    success: true,
    message: 'Notifications marked as read'
  });
});

export const deleteNotification: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const Notification = getNotificationModel(req.tenantDb!);
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({ _id: id, tenantId, userId });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

// Admin ONLY routes for managing templates
export const getTemplates: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const NotificationTemplate = getNotificationTemplateModel(req.tenantDb!);
  const templates = await NotificationTemplate.find({ tenantId }).sort({ notificationType: 1 });

  res.json({
    success: true,
    data: templates
  });
});

export const updateTemplate: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const NotificationTemplate = getNotificationTemplateModel(req.tenantDb!);
  const { id } = req.params;
  
  const template = await NotificationTemplate.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.json({
    success: true,
    data: template
  });
});

export const createTemplate: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const NotificationTemplate = getNotificationTemplateModel(req.tenantDb!);
  
  const template = await NotificationTemplate.create({
    ...req.body,
    tenantId
  });

  res.status(201).json({
    success: true,
    data: template
  });
});

// Development/Testing endpoint
export const triggerTestNotification: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user!;
  const tenantDb = req.tenantDb!;
  
  const notification = await NotificationService.sendNotification(tenantDb, tenantId, {
    userId,
    type: req.body.type,
    title: req.body.title || 'Test Notification',
    body: req.body.body || 'This is a test notification payload',
    channels: req.body.channels
  });

  res.json({
    success: true,
    data: notification
  });
});
