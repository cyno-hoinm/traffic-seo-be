import { RoleAttributes } from "../interfaces/Role.interface";
import { Role } from "../models/index.model";
import { ErrorType } from "../types/Error.type";

// Create a new role
export const createRoleRepo = async (
  roleData: Omit<RoleAttributes, "id" | "createdAt" | "updatedAt">
): Promise<Role> => {
  try {
    const role = await Role.create(roleData);
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get role by ID
export const getRoleByIdRepo = async (id: number): Promise<Role | null> => {
  try {
    const role = await Role.findByPk(id);
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get role by name
export const getRoleByNameRepo = async (name: string): Promise<Role | null> => {
  try {
    const role = await Role.findOne({
      where: {
        name,
        isDelete: false,
      },
    });
    return role;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get all roles
export const getAllRolesRepo = async (): Promise<Role[]> => {
  try {
    const roles = await Role.findAll({
      where: {
        isDelete: false,
      },
    });
    return roles;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Update role
export const updateRoleRepo = async (
  id: number,
  roleData: Partial<
    Omit<RoleAttributes, "id" | "createdAt" | "updatedAt" | "isDelete">
  >
): Promise<Role | null> => {
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

// Soft delete role
export const deleteRoleRepo = async (id: number): Promise<boolean> => {
  try {
    const role = await Role.findByPk(id);
    if (!role || role.isDelete) {
      return false;
    }

    await role.update({ isDelete: true });
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
