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
  page?: number;
  limit?: number;
}): Promise<{ notifications: Notification[]; total: number }> => {
  try {
    const where: any = { userId: filters.userId };

    if (filters.type) {
      where.type = filters.type;
    }

    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
    };

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
