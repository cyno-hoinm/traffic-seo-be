import { Op } from "sequelize";
import { RoleAttributes } from "../../interfaces/Role.interface";
import { Role } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

export const createRoleRepo = async (
  roleData: Omit<RoleAttributes, "id" | "createdAt" | "updatedAt">
): Promise<RoleAttributes> => {
  try {
    const role = await Role.create(roleData);
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getRoleByIdRepo = async (id: number): Promise<RoleAttributes | null> => {
  try {
    const role = await Role.findByPk(id);
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getRoleByNameRepo = async (name: string): Promise<RoleAttributes | null> => {
  try {
    const role = await Role.findOne({
      where: {
        name,
        isDeleted: false,
      },
    });
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getAllRolesRepo = async (): Promise<RoleAttributes[]> => {
  try {
    const roles = await Role.findAll({
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });
    return roles;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateRoleRepo = async (
  id: number,
  roleData: Partial<
    Omit<RoleAttributes, "id" | "createdAt" | "updatedAt" | "isDelete">
  >
): Promise<RoleAttributes | null> => {
  try {
    const role = await Role.findByPk(id);
    if (!role || role.isDelete) {
      return null;
    }

    await role.update(roleData);
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const deleteRoleRepo = async (id: number): Promise<boolean> => {
  try {
    const role = await Role.findByPk(id);
    if (!role || role.isDelete) {
      return false;
    }

    await role.update({ isDeleted: true });
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const searchRoleRepo = async (
  key: string | undefined,
  page: number,
  limit: number
): Promise<{ roles: RoleAttributes[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;

    // Build where clause for search
    const where: any = {
      isDeleted: false,
    };

    if (key) {
      where[Op.or] = [
        { name: { [Op.like]: `%${key}%` } }, // Use Op.like for MySQL
      ];
    }

    // Query roles with pagination and search
    const { rows: roles, count: total } = await Role.findAndCountAll({
      where,
      limit: limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      roles,
      total,
    };
  } catch (error) {
    throw new Error(`Error searching roles: ${(error as Error).message}`);
  }
};
