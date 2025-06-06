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
import { startCampaignStatusService } from "./services/campaignStatus.service";
import { startCampaignRefundService } from "./services/campaignRefund.service"; // New service
import callbackRoute from "./routes/system.route/moneyRoute/callback.route";
import bodyParser from "body-parser";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

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
  cluster.fork({ WORKER_TYPE: "campaignStatus" });
  cluster.fork({ WORKER_TYPE: "campaignRefund" }); // New worker for campaign refund

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
    const httpServer = createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONT_END_URL || "*",
        methods: ["GET", "POST"]
      }
    });

    // Socket.IO connection handling
    io.on("connection", (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle user authentication and room joining
      socket.on("join", (userId: number) => {
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Make io accessible globally
    (global as any).io = io;

    app.use(
      "/callback",
      bodyParser.json({
        verify: (req: any, res, buf) => {
          req.rawBody = buf.toString();
        },
      })
    );
    app.set("trust proxy", 1);
    configureMiddleware(app);
    app.use("/callback", callbackRoute);
    configureRoutes(app);

    let server: Server;
    const startServer = async () => {
      try {
        await connectDB();
        await redisClient.connect();
        server = httpServer.listen(PORT, () => {
          logger.info(`App worker ${process.pid} started on port ${PORT}`);
          debugApp(`App worker ${process.pid} successfully started`);
        });
      } catch (error: any) {
        logger.error(`Database host: ${process.env.DB_HOST}`);
        logger.error("Failed to start server:", error.message);
        process.exit(1);
      }
    };
    // startCampaignRefundService();
    startServer();
    // startEmailService();
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
  } else if (workerType === "campaignStatus") {
    const startCampaignStatusWorker = async () => {
      try {
        await connectDB();
        await redisClient.connect();
        await startCampaignStatusService();
        logger.info(`Campaign status worker ${process.pid} started`);
      } catch (error: any) {
        logger.error("Failed to start campaign status worker:", error.message);
        process.exit(1);
      }
    };

    startCampaignStatusWorker();

    process.on("SIGTERM", async () => {
      logger.info(`Campaign status worker ${process.pid} received SIGTERM`);
      await redisClient.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info(`Campaign status worker ${process.pid} received SIGINT`);
      await redisClient.disconnect();
      process.exit(0);
    });
  } else if (workerType === "campaignRefund") {
    const startCampaignRefundWorker = async () => {
      try {
        await connectDB();
        await redisClient.connect();
        await startCampaignRefundService();
        logger.info(`Campaign refund worker ${process.pid} started`);
      } catch (error: any) {
        logger.error("Failed to start campaign refund worker:", error.message);
        process.exit(1);
      }
    };

    startCampaignRefundWorker();

    process.on("SIGTERM", async () => {
      logger.info(`Campaign refund worker ${process.pid} received SIGTERM`);
      await redisClient.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info(`Campaign refund worker ${process.pid} received SIGINT`);
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
