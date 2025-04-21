import { Permission } from "../../models/index.model";
import { PermissionAttributes } from "../../interfaces/Permission.interface";
import { Op, WhereOptions } from "sequelize";

export const createPermissionRepo = async (
  permissionData: Omit<PermissionAttributes, "id" | "createdAt" | "updatedAt">
): Promise<PermissionAttributes> => {
  try {
    const permission = await Permission.create(permissionData);
    return permission.toJSON() as PermissionAttributes;
  } catch (error) {
    throw new Error(`Error creating permission: ${(error as Error).message}`);
  }
};

export const findPermissionByIdRepo = async (
  id: number
): Promise<PermissionAttributes | null> => {
  try {
    const permission = await Permission.findByPk(id);
    return permission ? (permission.toJSON() as PermissionAttributes) : null;
  } catch (error) {
    throw new Error(
      `Error finding permission by ID: ${(error as Error).message}`
    );
  }
};

export const findAllPermissionsRepo = async (): Promise<
  PermissionAttributes[]
> => {
  try {
    const permissions = await Permission.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return permissions.map(
      (permission) => permission.toJSON() as PermissionAttributes
    );
  } catch (error) {
    throw new Error(
      `Error finding all permissions: ${(error as Error).message}`
    );
  }
};

export const updatePermissionRepo = async (
  id: number,
  permissionData: Partial<
    Omit<PermissionAttributes, "id" | "createdAt" | "updatedAt">
  >
): Promise<PermissionAttributes | null> => {
  try {
    const permission = await Permission.findByPk(id);
    if (!permission) return null;

    await permission.update(permissionData);
    return permission.toJSON() as PermissionAttributes;
  } catch (error) {
    throw new Error(`Error updating permission: ${(error as Error).message}`);
  }
};

export const deletePermissionRepo = async (id: number): Promise<boolean> => {
  try {
    const permission = await Permission.findByPk(id);
    if (!permission) return false;

    await permission.update({ isDeleted: true });
    return true;
  } catch (error) {
    throw new Error(`Error deleting permission: ${(error as Error).message}`);
  }
};

export const searchPermissionRepo = async (
  key: string | undefined,
  page: number,
  size: number

): Promise<{ permissions: PermissionAttributes[]; total: number }> => {
  try {
    const offset = (page - 1) * size;

    // Build where clause for search
    const where: WhereOptions<Permission> = {
      isDeleted: false,
    };

    if (key) {
      where.name = {
        [Op.iLike]: `%${key}%`, // Case-insensitive search
      };
      where.code = {
        [Op.iLike]: `%${key}%`, // Case-insensitive search
      };
    }

    // Query roles with pagination and search
    const { rows: permissions, count: total } =
      await Permission.findAndCountAll({
        where,
        limit: size,
        offset,
        order: [["createdAt", "DESC"]],
      });

    return {
      permissions,
      total,
    };
  } catch (error) {
    throw new Error(`Error searching roles: ${(error as Error).message}`);
  }
};
