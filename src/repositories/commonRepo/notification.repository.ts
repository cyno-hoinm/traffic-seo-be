import { Transaction } from "sequelize";
import { NotificationAttributes } from "../../interfaces/Notification.interface";
import { Notification } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { logger } from "../../config/logger.config";
import { Op, Sequelize } from "sequelize";

// Create a new notification
export const createNotificationRepo = async (data: {
  userId: number[];
  name: string;
  content: string;
  type: string;
}, transaction?: Transaction): Promise<NotificationAttributes> => {
  try {
    logger.info(`Creating notification for users: ${data.userId.join(', ')}`);
    
    const notification = await Notification.create({
      ...data,
      userId: data.userId,
    }, { transaction });

    // Emit real-time notification
    try {
      const io = (global as any).io;
      if (io) {
        logger.info('Socket.io instance found, emitting notification');
        const notificationData = {
          id: notification.id,
          name: notification.name,
          content: notification.content,
          type: notification.type,
          createdAt: notification.createdAt,
        };

        notification.userId.forEach((userId: number) => {
          const room = `user_${userId}`;
          logger.info(`Emitting to room: ${room}`);
          io.to(room).emit("newNotification", notificationData);
        });
      } else {
        logger.warn('Socket.io instance not found, notification saved but not emitted');
      }
    } catch (socketError: any) {
      // Log socket error but don't fail the notification creation
      logger.error('Error emitting socket notification:', socketError.message);
    }

    return notification;
  } catch (error: any) {
    logger.error('Error creating notification:', error.message);
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get notifications by userId and type
export const getNotificationsByUserIdAndTypeRepo = async (filters: {
  userId: number;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ notifications: NotificationAttributes[]; total: number }> => {
  try {
    const where: any = {
      [Op.and]: [
        Sequelize.literal(`JSON_CONTAINS(userId, '${JSON.stringify([filters.userId])}')`),
      ]
    };

    if (filters.type) {
      where.type = filters.type;
    }
    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
    };
    // console.log("queryOptions", queryOptions);
    // Apply pagination only if page and limit are not 0
    if (
      filters.page &&
      filters.limit &&
      filters.page > 0 &&
      filters.limit > 0
    ) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: notifications, count: total } =
      await Notification.findAndCountAll(queryOptions);

    return { notifications, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
