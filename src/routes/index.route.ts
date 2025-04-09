import express from "express";
import adminRoute from "./admin.route/index.route";
import clientRoute from "./client.route/index.route";
export const configureRoutes = (app: express.Application) => {
  // API Routes
  app.use("/api/admin", adminRoute);
  // app.use("/api/client", clientRoute);
};
