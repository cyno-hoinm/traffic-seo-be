import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler, requestLogger } from "./logger";
import limiter from "./rateLimit";
import compression from "compression";
// import { corsConfig } from "../config/cors.config";

export const configureMiddleware = (app: Application) => {
  // Logging middleware must be first
  app.use(requestLogger);

  // Body parsing middleware

  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Security middleware
  app.use(helmet());
  app.use(cors());
  // app.use(cors(corsConfig));
  app.use(limiter);

  // Error handler should be last
  app.use(errorHandler);
};
