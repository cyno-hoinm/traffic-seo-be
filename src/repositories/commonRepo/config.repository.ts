import statusCode from "../../constants/statusCode";
import { ConfigAttributes } from "../../interfaces/Config.interface";
import { Config } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

// Create a new config
export const createConfigRepo = async (
  configData: Omit<ConfigAttributes, "id" | "createdAt" | "updatedAt">
): Promise<ConfigAttributes> => {
  const existingConfig = await Config.findOne({
    where: { name: configData.name },
  });
  if (existingConfig) {
    throw new ErrorType(
      "ValidationError",
      "Config with this name already exists",
      statusCode.BAD_REQUEST
    );
  }
  const config = await Config.create(configData);
  return config.toJSON() as ConfigAttributes;
};

// Get config by name
export const getConfigByNameRepo = async (
  name: string
): Promise<ConfigAttributes | null> => {
  const config = await Config.findOne({ where: { name } });
  return config ? (config.toJSON() as ConfigAttributes) : null;
};

// Get all configs
export const getAllConfigsRepo = async (): Promise<ConfigAttributes[]> => {
  const configs = await Config.findAll();
  return configs.map((config) => config.toJSON() as ConfigAttributes);
};

// Get a config by ID
export const getConfigByIdRepo = async (id: number): Promise<ConfigAttributes> => {
  const config = await Config.findByPk(id);
  if (!config) {
    throw new ErrorType("NotFoundError", "Config not found", statusCode.NOT_FOUND);
  }
  return config.toJSON() as ConfigAttributes;
};

// Update a config by ID
export const updateConfigRepo = async (
  id: number,
  configData: Partial<Omit<ConfigAttributes, "id" | "createdAt" | "updatedAt">>
): Promise<ConfigAttributes> => {
  const config = await Config.findByPk(id);
  if (!config) {
    throw new ErrorType("NotFoundError", "Config not found", statusCode.NOT_FOUND);
  }
  if (configData.name && configData.name !== config.name) {
    const existingConfig = await Config.findOne({
      where: { name: configData.name },
    });
    if (existingConfig) {
      throw new ErrorType(
        "ValidationError",
        "Config with this name already exists",
        statusCode.BAD_REQUEST
      );
    }
  }
  await config.update(configData);
  return config.toJSON() as ConfigAttributes;
};

// Delete a config by ID
export const deleteConfigRepo = async (id: number): Promise<void> => {
  const config = await Config.findByPk(id);
  if (!config) {
    throw new ErrorType("NotFoundError", "Config not found", statusCode.NOT_FOUND);
  }
  await config.destroy();
};