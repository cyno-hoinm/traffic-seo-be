import express from "express";
import adminRoute from "./admin.route/index.route"
import clientRoute from "./client.route/index.route"
export const configureRoutes = (app: express.Application) => {
  const apiRouter = express.Router();
  // API Routes
  apiRouter.use("/admin", adminRoute);
  apiRouter.use("/client", clientRoute);
};
