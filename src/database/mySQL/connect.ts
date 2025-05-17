import { dbHost, dbName } from "../../config/database.config";
import { logger } from "../../config/logger.config";
import { sequelizeSystem } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { pool } from "./config.database";
// import { initializePermissions } from "./initPermission";

// Export connect and disconnect functions
export const connectDB = async (): Promise<void> => {
  try {
    await sequelizeSystem.authenticate();
    // await initializePermissions(); // Initialize permissions if needed
    // await sequelizeSystem.sync({ force: false, alter: false });
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

export const connectDBPooling = async (): Promise<void> => {
  let connection;
  try {
      logger.info(`Attempting to connect to MySQL database: ${dbName} at ${dbHost}`);
      connection = await pool.getConnection();
      logger.info('Successfully connected to MySQL');
  } catch (error: any) {
      logger.error('Failed to connect to MySQL', {
          error: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState
      });
      throw new ErrorType('DatabaseConnectionError', 'Failed to connect to MySQL', error.code);
  } finally {
      if (connection) {
          connection.release();
          logger.info('Database connection released');
      }
  }
};

export default sequelizeSystem;
