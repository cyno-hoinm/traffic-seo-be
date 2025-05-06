export interface UserAttributes {
  id?: number;
  username: string;
  password?: string;
  email: string;
  roleId: number;
  role?: any;
  invitedBy?: number;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
