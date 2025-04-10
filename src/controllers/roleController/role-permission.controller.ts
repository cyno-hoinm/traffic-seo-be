import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import { ResponseType } from "../../types/Response.type";
import { RolePermissionAttributes } from "../../interfaces/RolePermission.interface";
import {
  createRolePermissionRepo,
  findRolePermissionByIdRepo,
  findAllRolePermissionsRepo,
  updateRolePermissionRepo,
  deleteRolePermissionRepo,
} from "../../repositories/roleRepo/role-permission.repository";

// Create a new role-permission association
export const createRolePermission = async (
  req: Request,
  res: Response<ResponseType<RolePermissionAttributes>>
): Promise<void> => {
  try {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: "Both roleId and permissionId are required",
      });
      return;
    }

    const rolePermission = await createRolePermissionRepo({
      roleId,
      permissionId,
    });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Role-permission created successfully",
      data: rolePermission,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a role-permission by ID
export const getRolePermissionById = async (
  req: Request,
  res: Response<ResponseType<RolePermissionAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const rolePermissionId = parseInt(id, 10);

    if (isNaN(rolePermissionId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid role-permission ID",
      });
      return;
    }

    const rolePermission = await findRolePermissionByIdRepo(rolePermissionId);

    if (!rolePermission) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Role-permission not found",
        error: "Role-permission not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Role-permission retrieved successfully",
      data: rolePermission,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all role-permissions
export const getAllRolePermissions = async (
  req: Request,
  res: Response<ResponseType<RolePermissionAttributes>>
): Promise<void> => {
  try {
    const rolePermissions = await findAllRolePermissionsRepo();

    res.status(statusCode.OK).json({
      status: true,
      message: "Role-permissions retrieved successfully",
      data: rolePermissions,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a role-permission by ID
export const updateRolePermission = async (
  req: Request,
  res: Response<ResponseType<RolePermissionAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { roleId, permissionId } = req.body;
    const rolePermissionId = parseInt(id, 10);

    if (isNaN(rolePermissionId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid role-permission ID",
      });
      return;
    }

    if (!roleId && !permissionId) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: "At least one of roleId or permissionId is required to update",
      });
      return;
    }

    const existingRolePermission = await findRolePermissionByIdRepo(rolePermissionId);
    if (existingRolePermission) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Role-permission update failed",
        error: "This role-permission association already exists",
      });
      return;
    }

    const updatedRolePermission = await updateRolePermissionRepo(
      rolePermissionId,
      { roleId, permissionId }
    );

    if (!updatedRolePermission) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Role-permission not found",
        error: "Role-permission not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Role-permission updated successfully",
      data: updatedRolePermission,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a role-permission by ID
export const deleteRolePermission = async (
  req: Request,
  res: Response<ResponseType<RolePermissionAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const rolePermissionId = parseInt(id, 10);

    if (isNaN(rolePermissionId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid role-permission ID",
      });
      return;
    }

    const deleted = await deleteRolePermissionRepo(rolePermissionId);

    if (!deleted) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Role-permission not found",
        error: "Role-permission not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Role-permission deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
