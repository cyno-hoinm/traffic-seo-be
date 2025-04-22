import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import { ResponseType } from "../../types/Response.type";
import { ConfigAttributes } from "../../interfaces/Config.interface";
import {
  createConfigRepo,
  deleteConfigRepo,
  getAllConfigsRepo,
  getConfigByIdRepo,
  getConfigByNameRepo,
  updateConfigRepo,
} from "../../repositories/commonRepo/config.repository";

// Create a new config
export const createConfig = async (
  req: Request,
  res: Response<ResponseType<ConfigAttributes>>
): Promise<void> => {
  try {
    const { name, value } = req.body;

    if (!name || !value) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Name and value are required",
        error: "Missing required fields",
      });
      return;
    }

    const config = await createConfigRepo({ name, value });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Config created successfully",
      data: {
        id: config.id,
        name: config.name,
        value: config.value,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating config",
      error: error.message,
    });
  }
};

// Get all configs
export const getAllConfigs = async (
  req: Request,
  res: Response<ResponseType<ConfigAttributes[]>>
): Promise<void> => {
  try {
    const configs = await getAllConfigsRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Configs retrieved successfully",
      data: configs.map((config: ConfigAttributes) => ({
        id: config.id,
        name: config.name,
        value: config.value,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching configs",
      error: error.message,
    });
  }
};

// Get config by ID
export const getConfigById = async (
  req: Request,
  res: Response<ResponseType<ConfigAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const config = await getConfigByIdRepo(Number(id));

    if (!config) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Config not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Config retrieved successfully",
      data: {
        id: config.id,
        name: config.name,
        value: config.value,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching config",
      error: error.message,
    });
  }
};

export const getConfigByName = async (
  req: Request,
  res: Response<ResponseType<ConfigAttributes>>
): Promise<void> => {
  try {
    const { name } = req.params;
    const config = await getConfigByNameRepo(name);

    if (!config) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Config not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Config retrieved successfully",
      data: {
        id: config.id,
        name: config.name,
        value: config.value,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching config",
      error: error.message,
    });
  }
};
// Update config
export const updateConfig = async (
  req: Request,
  res: Response<ResponseType<ConfigAttributes>>
): Promise<void> => {
  try {
    const { name } = req.params;
    const { value } = req.body;

    if (!name && !value) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "At least one field (name or value) is required",
        error: "Missing required fields",
      });
      return;
    }

    const config = await updateConfigRepo(name, { value });

    if (!config) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Config not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Config updated successfully",
      data: {
        id: config.id,
        name: config.name,
        value: config.value,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error updating config",
      error: error.message,
    });
  }
};

// Delete config
export const deleteConfig = async (
  req: Request,
  res: Response<ResponseType<ConfigAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteConfigRepo(Number(id));

    res.status(statusCode.OK).json({
      status: true,
      message: "Config deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error deleting config",
      error: error.message,
    });
  }
};
