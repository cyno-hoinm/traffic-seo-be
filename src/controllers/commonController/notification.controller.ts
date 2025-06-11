import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  createNotificationRepo,
  getNotificationsByUserIdAndTypeRepo,
} from "../../repositories/commonRepo/notification.repository"; // Adjust path

import { NotificationAttributes } from "../../interfaces/Notification.interface";
import { ResponseType } from "../../types/Response.type";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";

// Create a new notification
export const createNotification = async (
  req: Request,
  res: Response<ResponseType<NotificationAttributes>>
): Promise<void> => {
  try {
    const { userId, name, content, type } = req.body;

    if (!userId || !name || !content || !type) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All fields (userId, name, content, type) are required",
        error: "Missing or invalid field",
      });
      return;
    }

    const notification = await createNotificationRepo({
      userId: Array.isArray(userId) ? userId : [userId],
      name,
      content,
      type,
    });

    // Emit real-time notification
    const io = (global as any).io;
    if (io) {
      const notificationData = {
        id: notification.id,
        name: notification.name,
        content: notification.content,
        type: notification.type,
        createdAt: notification.createdAt,
      };

      notification.userId.forEach((userId: number) => {
        io.to(`user_${userId}`).emit("newNotification", notificationData);
      });
    }

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};

// Get notifications by userId and type
export const getNotificationsByUserIdAndType = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<{ notifications: NotificationAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { userId, type, page, limit } = req.body;
    
    if (req.data?.id != userId) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You are not authorized to access this resource",
        error: "Forbidden",
      });
      return;
    }

    const filters = {
      userId: Number(userId),
      type: type as string | undefined,
      page: page as number | undefined,
      limit: limit as number | undefined,
    };
    console.log("filters", filters);
    const { notifications, total } = await getNotificationsByUserIdAndTypeRepo(filters);
    
    res.status(statusCode.OK).json({
      status: true,
      message: "Notifications retrieved successfully",
      data: { notifications, total },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};
