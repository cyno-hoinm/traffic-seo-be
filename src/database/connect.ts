import { logger } from "../config/logger.config";
import { sequelizeSystem } from "../models/index.model";

// Export connect and disconnect functions
export const connectDB = async (): Promise<void> => {
  try {
    await sequelizeSystem.authenticate();
    logger.info("Connected to PostgreSQL" );
  } catch (error) {
    logger.error("Failed to connect to PostgreSQL:", error);
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
