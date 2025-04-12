export interface NotificationAttributes {
    id?: number;
    userId: number;
    name: string;
    content: string;
    type: string;
    isDeleted?: boolean;
    createdAt?: Date;
  }