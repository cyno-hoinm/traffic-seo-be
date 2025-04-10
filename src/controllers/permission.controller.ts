import { Request, Response } from "express";
import statusCode from "../constants/statusCode";
import { ResponseType } from "../types/Response.type";
import { PermissionAttributes } from "../interfaces/Permission.interface";
import {
  createPermissionRepo,
  findPermissionByIdRepo,
  findAllPermissionsRepo,
  updatePermissionRepo,
  deletePermissionRepo,
} from "../repositories/permission.repository";

// Create a new permission
export const createPermission = async (
  req: Request,
  res: Response<ResponseType<PermissionAttributes>>
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: "Permission name is required",
      });
      return;
    }

    const permission = await createPermissionRepo({ name });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a permission by ID
export const getPermissionById = async (
  req: Request,
  res: Response<ResponseType<PermissionAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid permission ID",
      });
      return;
    }

    const permission = await findPermissionByIdRepo(permissionId);

    if (!permission) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Permission not found",
        error: "Permission not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Permission retrieved successfully",
      data: permission,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all permissions
export const getAllPermissions = async (
  req: Request,
  res: Response<ResponseType<PermissionAttributes>>
): Promise<void> => {
  try {
    const permissions = await findAllPermissionsRepo();

    res.status(statusCode.OK).json({
      status: true,
      message: "Permissions retrieved successfully",
      data: permissions,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a permission by ID
export const updatePermission = async (
  req: Request,
  res: Response<ResponseType<PermissionAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid permission ID",
      });
      return;
    }

    if (!name) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: "Permission name is required to update",
      });
      return;
    }

    const existingPermission = await findPermissionByIdRepo(permissionId);
    if (existingPermission) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Permission update failed",
        error: "Permission name already exists",
      });
      return;
    }

    const updatedPermission = await updatePermissionRepo(permissionId, { name });

    if (!updatedPermission) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Permission not found",
        error: "Permission not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Permission updated successfully",
      data: updatedPermission,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a permission by ID
export const deletePermission = async (
  req: Request,
  res: Response<ResponseType<PermissionAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid permission ID",
      });
      return;
    }

    const deleted = await deletePermissionRepo(permissionId);

    if (!deleted) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Permission not found",
        error: "Permission not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Permission deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};