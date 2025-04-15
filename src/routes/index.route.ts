import express from "express";
import { setupSwaggerDocs } from "../swagger";
import { routeConfig } from "./route.config";
import paymentRoute from "./common.route/payment.route";
import { authenticateToken } from "../middleware/auth";

export const configureRoutes = (app: express.Application) => {
  routeConfig.forEach(({ docsPath, apiPath, spec, route }) => {
    setupSwaggerDocs(app, docsPath, spec); // Swagger docs
    app.use(apiPath, route); // API routes
  });
  app.use("/", authenticateToken, paymentRoute);

};
