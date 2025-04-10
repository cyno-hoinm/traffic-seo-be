export interface UserAttributes {
    id?: number;
    username: string;
    password?: string;
    email: string;
    roleId: number;
    createdAt?: Date;
    updatedAt?: Date;
  }