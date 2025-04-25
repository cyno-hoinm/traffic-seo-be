import express from "express";
import dotenv from "dotenv";
import cluster from "cluster";
import os from "os";
import debug from "debug";
import { logger } from "./config/logger.config";
import { connectDB } from "./database/mySQL/connect";
import { gracefulShutdown } from "./utils/utils";
import { configureRoutes } from "./routes/index.route";
import { configureMiddleware } from "./middleware";
import { Server } from "http";
import { ExtendedWorker } from "./types/Worker.type";
import { redisClient } from "./config/redis.config";
import { startBackupService } from "./services/backUpDatabase.service";
import { startEmailService } from "./services/sendMail.service";
import callbackRoute from "./routes/system.route/moneyRoute/callback.route";
import bodyParser from "body-parser";

dotenv.config();

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === "development";

const numCPUs = os.cpus().length;
const debugApp = debug("app");

if (cluster.isPrimary && !isDev) {
  logger.info(`Primary process ${process.pid} is running`);
  debugApp(`Starting primary process with ${numCPUs} CPU cores`);

  // Fork one worker for each service
  cluster.fork({ WORKER_TYPE: "app" });
  cluster.fork({ WORKER_TYPE: "email" });
  cluster.fork({ WORKER_TYPE: "backup" });

  cluster.on("exit", (worker: ExtendedWorker, code, signal) => {
    logger.warn(
      `Worker ${worker.process.pid} (${worker.process.env.WORKER_TYPE}) died with code ${code} and signal ${signal}`
    );
    logger.info(`Restarting ${worker.process.env.WORKER_TYPE} worker...`);
    cluster.fork({ WORKER_TYPE: worker.process.env.WORKER_TYPE });
  });
} else {
  const workerType = process.env.WORKER_TYPE || "app";
  logger.info(`Worker ${process.pid} started with type: ${workerType}`);

  if (workerType === "app") {
    const app = express();
    app.use(
      "/callback",
      bodyParser.json({
        verify: (req: any, res, buf) => {
          req.rawBody = buf.toString();
        },
      })
    );
    configureMiddleware(app);
    app.use("/callback", callbackRoute);
    configureRoutes(app);

    let server: Server;
    const startServer = async () => {
      try {
        await connectDB();
        await redisClient.connect();
        server = app.listen(PORT, () => {
          logger.info(`App worker ${process.pid} started on port ${PORT}`);
          debugApp(`App worker ${process.pid} successfully started`);
        });
      } catch (error: any) {
        logger.error(`Database host: ${process.env.DB_HOST}`);
        logger.error("Failed to start server:", error.message);
        process.exit(1);
      }
    };

    startServer();
    startBackupService();
    process.on("SIGTERM", async () => {
      logger.info(`App worker ${process.pid} received SIGTERM`);
      await gracefulShutdown(server, "SIGTERM");
      await redisClient.disconnect();
      logger.info("Sequelize pool and Redis closed");
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info(`App worker ${process.pid} received SIGINT`);
      await gracefulShutdown(server, "SIGINT");
      await redisClient.disconnect();
      process.exit(0);
    });
  } else if (workerType === "email") {
    const startEmailWorker = async () => {
      try {
        await redisClient.connect();
        await startEmailService();
        logger.info(`Email worker ${process.pid} started`);
      } catch (error: any) {
        logger.error("Failed to start email worker:", error.message);
        process.exit(1);
      }
    };

    startEmailWorker();

    process.on("SIGTERM", async () => {
      logger.info(`Email worker ${process.pid} received SIGTERM`);
      await redisClient.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info(`Email worker ${process.pid} received SIGINT`);
      await redisClient.disconnect();
      process.exit(0);
    });
  } else if (workerType === "backup") {
    const startBackupWorker = async () => {
      try {
        await connectDB();
        await redisClient.connect();
        await startBackupService();
        logger.info(`Backup worker ${process.pid} started`);
      } catch (error: any) {
        logger.error("Failed to start backup worker:", error.message);
        process.exit(1);
      }
    };

    startBackupWorker();

    process.on("SIGTERM", async () => {
      logger.info(`Backup worker ${process.pid} received SIGTERM`);
      await redisClient.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info(`Backup worker ${process.pid} received SIGINT`);
      await redisClient.disconnect();
      process.exit(0);
    });
  } else {
    logger.error(`Unknown worker type: ${workerType}`);
    process.exit(1);
  }

  if (isDev) {
    logger.info("Running in development mode with hot-reloading enabled.");
  }
}