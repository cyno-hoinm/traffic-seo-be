export interface RoleAttributes {
    id?: number;
    name: string;
    isDeleted?: boolean;
    permissions?: any[] | null;
    createdAt?: Date;
    updatedAt?: Date;
  }