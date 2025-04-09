import { swaggerSpecAdmin, swaggerSpecClient } from "../swagger";
import adminRoute from "./admin.route/index.route";
import clientRoute from "./client.route/index.route";

export const routeConfig = [
  {
    docsPath: "/api/admin/docs",
    apiPath: "/api/admin",
    spec: swaggerSpecAdmin,
    route: adminRoute,
  },
  {
    docsPath: "/api/client/docs",
    apiPath: "/api/client",
    spec: swaggerSpecClient,
    route: clientRoute,
  },
];
