import { Sequelize } from "sequelize";
import { logger } from "../config/logger.config";
import {
  connectTimeoutMS,
  maxPoolSize,
  minPoolSize,
  socketTimeoutMS,
} from "../config/database.config";
import dotenv from "dotenv";
dotenv.config();
// Validate and parse environment variables
const dbName = process.env.DB_NAME ?? "seo_traffic";
const dbUser = process.env.DB_US ?? "postgres";
const dbPassword = process.env.DB_PW ?? "password";
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = parseInt(process.env.DB_PORT ?? "5432", 10);

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: (msg: any) => logger.info(msg), // Log SQL queries using Winston
  pool: {
    max: maxPoolSize,
    min: minPoolSize,
    acquire: socketTimeoutMS, // Maximum time (ms) to acquire a connection
    idle: connectTimeoutMS, // Maximum time (ms) a connection can be idle
  },
});

// Export connect and disconnect functions
export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Sync models with the database
    logger.info("Connected to PostgreSQL");
  } catch (error) {
    logger.error("Failed to connect to PostgreSQL:", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info("Disconnected from PostgreSQL");
  } catch (error) {
    logger.error("Failed to disconnect from PostgreSQL:", error);
    throw error;
  }
};

export default sequelize;
