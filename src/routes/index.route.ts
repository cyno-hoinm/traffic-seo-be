import express from "express";
import { setupSwaggerDocs } from "../swagger";
import { routeConfig } from "./route.config";
import paymentRoute from "./system.route/moneyRoute/payment.route";
import { getCampaignListForLLMController } from "../controllers/coreController/campaign.controller";
export const configureRoutes = (app: express.Application) => {
  routeConfig.forEach(({ docsPath, apiPath, spec, route }) => {
    setupSwaggerDocs(app, docsPath, spec); // Swagger docs
    app.use(apiPath, route); // API routes
  });
  app.use("/",paymentRoute)
  app.get("/campaigns/llm", getCampaignListForLLMController);
};
