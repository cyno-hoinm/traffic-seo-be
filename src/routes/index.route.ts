import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../swagger";
import adminRoute from "./admin.route/admin.route"
export const configureRoutes = (app: express.Application) => {
  const apiRouter = express.Router();

  // API Documentation
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Apply the /api/v1 prefix to all routes
  app.use("/api/v1", apiRouter);
  // API Routes
  apiRouter.use("/admin", adminRoute);
};
