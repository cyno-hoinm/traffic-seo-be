import {RolePermission,Role,Permission} from "../models/index.model";
import { RolePermissionAttributes } from "../interfaces/RolePermission.interface";

// Create a new role-permission association
export const createRolePermissionRepo = async (
  rolePermissionData: Omit<
    RolePermissionAttributes,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<RolePermissionAttributes> => {
  try {
    const rolePermission = await RolePermission.create(rolePermissionData);
    return rolePermission.toJSON() as RolePermissionAttributes;
  } catch (error) {
    throw new Error(
      `Error creating role-permission: ${(error as Error).message}`
    );
  }
};

// Find role-permission by ID with populated Role and Permission
export const findRolePermissionByIdRepo = async (
  id: number
): Promise<RolePermissionAttributes | null> => {
  try {
    const rolePermission = await RolePermission.findByPk(id, {
      attributes: { exclude: ["roleId", "permissionId"] }, // Exclude roleId and permissionId
      include: [
        { model: Role, as: "role" }, // Correct alias
        { model: Permission, as: "permission" }, // Correct alias
      ],
    });
    return rolePermission
      ? (rolePermission.toJSON() as RolePermissionAttributes)
      : null;
  } catch (error) {
    throw new Error(
      `Error finding role-permission by ID: ${(error as Error).message}`
    );
  }
};

// Find all role-permissions with populated Role and Permission
export const findAllRolePermissionsRepo = async (): Promise<
  RolePermissionAttributes[]
> => {
  try {
    const rolePermissions = await RolePermission.findAll({
      attributes: { exclude: ["roleId", "permissionId"] },
      include: [
        { model: Role, as: "role" }, // Assuming 'role' is the alias
        { model: Permission, as: "permission" }, // Assuming 'permission' is the alias
      ],
    });
    return rolePermissions.map((rp) => rp.toJSON() as RolePermissionAttributes);
  } catch (error) {
    throw new Error(
      `Error finding all role-permissions: ${(error as Error).message}`
    );
  }
};

// Update role-permission by ID
export const updateRolePermissionRepo = async (
  id: number,
  rolePermissionData: Partial<
    Omit<RolePermissionAttributes, "id" | "createdAt" | "updatedAt">
  >
): Promise<RolePermissionAttributes | null> => {
  try {
    const rolePermission = await RolePermission.findByPk(id, {
      attributes: { exclude: ["roleId", "permissionId"] },
      include: [
        { model: Role, as: "role" },
        { model: Permission, as: "permission" },
      ],
    });
    if (!rolePermission) return null;

    await rolePermission.update(rolePermissionData);
    return rolePermission.toJSON() as RolePermissionAttributes;
  } catch (error) {
    throw new Error(
      `Error updating role-permission: ${(error as Error).message}`
    );
  }
};

// Delete role-permission by ID
export const deleteRolePermissionRepo = async (
  id: number
): Promise<boolean> => {
  try {
    const rolePermission = await RolePermission.findByPk(id);
    if (!rolePermission) return false;

    await rolePermission.destroy();
    return true;
  } catch (error) {
    throw new Error(
      `Error deleting role-permission: ${(error as Error).message}`
    );
  }
};
