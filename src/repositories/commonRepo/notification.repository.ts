import { Notification } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

// Create a new notification
export const createNotificationRepo = async (data: {
  userId: number;
  name: string;
  content: string;
  type: string;
}): Promise<Notification> => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get notifications by userId and type
export const getNotificationsByUserIdAndTypeRepo = async (filters: {
  userId: number;
  type?: string;
}): Promise<Notification[]> => {
  try {
    const where: any = { userId: filters.userId };

    if (filters.type) {
      where.type = filters.type;
    }

    const notifications = await Notification.findAll({ where });
    return notifications;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
