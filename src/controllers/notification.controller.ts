import { Request, Response } from "express";
import statusCode from "../constants/statusCode"; // Adjust path
import {
  createNotificationRepo,
  getNotificationsByUserIdAndTypeRepo,
} from "../repositories/notification.repository"; // Adjust path
import { ResponseType } from "../types/Response.type"; // Adjust path
import { NotificationAttributes } from "../interfaces/Notification.interface";

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
      userId,
      name,
      content,
      type,
    });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Notification created successfully",
      data: {
        id: notification.id,
        userId: notification.userId,
        name: notification.name,
        content: notification.content,
        type: notification.type,
        createdAt: notification.createdAt,
      },
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
  req: Request,
  res: Response<ResponseType<NotificationAttributes[]>>
): Promise<void> => {
  try {
    const { userId, type } = req.query;

    if (!userId) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "userId is required",
        error: "Missing required field",
      });
      return;
    }

    const filters: { userId: number; type?: string } = {
      userId: Number(userId),
    };
    if (type) filters.type = type as string;

    const notifications = await getNotificationsByUserIdAndTypeRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Notifications retrieved successfully",
      data: notifications.map((notification: NotificationAttributes) => ({
        id: notification.id,
        userId: notification.userId,
        name: notification.name,
        content: notification.content,
        type: notification.type,
        createdAt: notification.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};
