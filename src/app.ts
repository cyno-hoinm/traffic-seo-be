import express from "express";
import dotenv from "dotenv";
import debug from "debug";
import { logger } from "./config/logger.config";
import { connectDB } from "./database/connect"; // Export sequelizeSystem
import { gracefulShutdown } from "./utils/utils";
import { configureRoutes } from "./routes/index.route";
import { configureMiddleware } from "./middleware";
import { Server } from "http";
import { redisClient } from "./config/redis.config";
import { startEmailService } from "./services/sendMail.service";

dotenv.config();

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === "development";
const debugApp = debug("app");

const app = express();
configureMiddleware(app);
configureRoutes(app);
let server: Server;
const startServer = async () => {
  try {
    await connectDB(); // Connect DB first
    await redisClient.connect();
    server = app.listen(PORT, () => {
      logger.info(`Worker ${process.pid} started on port ${PORT}`);
      debugApp(`Worker ${process.pid} successfully started`);
    });
    if (isDev) {
      startEmailService();
    }
  } catch (error: any) {
    logger.error(`My database host: ${process.env.DB_HOST}`);
    logger.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// // Graceful shutdown with Sequelize
process.on("SIGTERM", async () => {
  logger.info(`Worker ${process.pid} received SIGTERM`);
  await gracefulShutdown(server, "SIGTERM");
  logger.info("Sequelize pool closed");
  process.exit(0);
});

process.on("SIGINT", async () => {
  await gracefulShutdown(server, "SIGINT");
  process.exit(0);
});

if (isDev) {
  logger.info("Running in development mode with hot-reloading enabled.");
}
