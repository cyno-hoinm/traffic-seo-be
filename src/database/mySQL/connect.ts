import { logger } from "../../config/logger.config";
import { sequelizeSystem } from "../../models/index.model";
import { initializePermissions } from "./initPermission";

// Export connect and disconnect functions
export const connectDB = async (): Promise<void> => {
  try {
    await sequelizeSystem.authenticate();
    // await initializePermissions(); // Initialize permissions if needed
    // await sequelizeSystem.sync({ force: false, alter: true });
    logger.info("Connected to MySQL");
  } catch (error) {
    logger.error("Failed to connect to MySQL:", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await sequelizeSystem.close();
    logger.info("Disconnected from PostgreSQL");
  } catch (error) {
    logger.error("Failed to disconnect from PostgreSQL:", error);
    throw error;
  }
};

export default sequelizeSystem;
