import { swaggerSpec } from "../swagger";
import SystemRoute from "./system.route/index.route";

export const routeConfig = [
  {
    docsPath: "/api/docs",
    apiPath: "/api",
    spec: swaggerSpec,
    route: SystemRoute,
  },
];
