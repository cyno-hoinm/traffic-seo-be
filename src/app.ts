import express from "express";
import dotenv from "dotenv";
import cluster from "cluster";
import os from "os";
import debug from "debug";
import { logger } from "./config/logger.config";
import { connectDB } from "./database/connect"; // Export sequelizeSystem
import { gracefulShutdown } from "./utils/utils";
import { configureRoutes } from "./routes/index.route";
import { configureMiddleware } from "./middleware";
import { Server } from "http";
import { ExtendedWorker } from "./types/Worker.type";
import { redisClient } from "./config/redis.config";
import payOSPaymentMethod from "./config/payOs.config";


dotenv.config();

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === "development";

const numCPUs = os.cpus().length;
const debugApp = debug("app");

if (cluster.isPrimary && !isDev) {
  logger.info(`Primary process ${process.pid} is running`);
  debugApp(`Starting primary process with ${numCPUs} CPU cores`);

  const appWorkers = Math.ceil(numCPUs / 2);
  for (let i = 0; i < appWorkers; i++) {
    cluster.fork({ WORKER_TYPE: "app" });
  }

  cluster.on("exit", (worker: ExtendedWorker, code, signal) => {
    logger.warn(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    cluster.fork({ WORKER_TYPE: worker.process.env.WORKER_TYPE });
  });
} else {
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
}
