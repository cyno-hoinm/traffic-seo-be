import { Request, Response } from "express";
import statusCode from "../constants/statusCode";
import { 
  createRoleRepo,
  getRoleByIdRepo,
  getRoleByNameRepo,
  getAllRolesRepo,
  updateRoleRepo,
  deleteRoleRepo 
} from "../repositories/role.repository";
import { RoleAttributes } from "../interfaces/Role.interface";
import { ResponseType } from "../types/Response.type";

// Create a new role
export const createRole = async (req: Request, res: Response<ResponseType<RoleAttributes>>): Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Role name is required",
        error: "Missing required field"
      });
      return;
    }

    const existingRole = await getRoleByNameRepo(name);
    if (existingRole) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Role with this name already exists",
        error: "Duplicate role name"
      });
      return;
    }

    const role = await createRoleRepo({ name, isDelete: false });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Role created successfully",
      data: {
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating role",
      error: error.message
    });
  }
};

// Get all roles
export const getAllRoles = async (req: Request, res: Response<ResponseType<RoleAttributes>>): Promise<void> => {
  try {
    const roles = await getAllRolesRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Roles retrieved successfully",
      data: roles.map((role: RoleAttributes) => ({
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }))
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching roles",
      error: error.message
    });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response<ResponseType<RoleAttributes>>): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await getRoleByIdRepo(Number(id));

    if (!role || role.isDelete) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Role not found",
        error: "Resource not found"
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Role retrieved successfully",
      data: {
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching role",
      error: error.message
    });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response<ResponseType<RoleAttributes>>): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Role name is required",
        error: "Missing required field"
      });
      return;
    }

    const role = await updateRoleRepo(Number(id), { name });

    if (!role) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Role not found",
        error: "Resource not found"
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Role updated successfully",
      data: {
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error updating role",
      error: error.message
    });
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response<ResponseType<RoleAttributes>>): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await deleteRoleRepo(Number(id));

    if (!success) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Role not found",
        error: "Resource not found"
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Role deleted successfully"
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error deleting role",
      error: error.message
    });
  }
};