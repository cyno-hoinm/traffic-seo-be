export interface UserAttributes {
    id?: number;
    username: string;
    password?: string;
    email: string;
    roleId: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }