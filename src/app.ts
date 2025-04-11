// Base libraries
import express from "express";
import dotenv from "dotenv";
import cluster from "cluster";
import os from "os";
import debug from "debug";
// Config
import { logger } from "./config/logger.config";
import { connectDB } from "./database/connect";
import { gracefulShutdown } from "./utils/utils";
import { ExtendedWorker } from "./types/Worker.type";
import { configureRoutes } from "./routes/index.route";
import { configureMiddleware } from "./middleware";
dotenv.config();

// PORT and Environment
const PORT =  3000;
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
    debugApp(`Worker ${worker.process.pid} exited`);
    logger.info("Starting a new worker...");
    cluster.fork({ WORKER_TYPE: worker.process.env.WORKER_TYPE });
  });
} else {
  // Start the HTTP server in this worker
  const app = express();
  // Configure middleware
  configureMiddleware(app);
  // // Configure routes
  configureRoutes(app);
  const server = app.listen(PORT, async () => {
    try {
      debugApp(`Worker ${process.pid} attempting to connect to DB and Redis`);
      await connectDB();
      logger.info(`Worker ${process.pid} started on port ${PORT}`);

      debugApp(`Worker ${process.pid} successfully started`);
    } catch (error: any) {
      logger.error("Failed to start server:", error.message);
      debugApp(`Worker ${process.pid} failed: ${error.message}`);
      process.exit(1);
    }
  });

  // Graceful shutdown handling
  process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));

  if (isDev) {
    logger.info("Running in development mode with hot-reloading enabled.");
    debugApp("Debug mode active with hot-reloading");
  }
}
