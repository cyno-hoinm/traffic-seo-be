export interface UserAttributes {
  id?: number;
  username: string;
  phoneNumber?: string;
  password?: string;
  email: string;
  roleId: number;
  role?: any;
  invitedBy?: number;
  imageId?: number;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
