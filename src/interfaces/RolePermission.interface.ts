export interface RolePermissionAttributes {
    id?: number;
    roleId: number;
    permissionId: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }