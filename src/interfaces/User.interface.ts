export interface UserAttributes {
  id?: number;
  username: string;
  password?: string;
  email: string;
  roleId: number;
  role?: any;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
