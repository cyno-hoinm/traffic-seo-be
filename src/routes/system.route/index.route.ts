import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { protectedRoutes, publicRoutes } from "./config";

const SystemRouter = express.Router();

Object.entries(publicRoutes).forEach(([path, route]) => {
  SystemRouter.use(path, route);
});

// Register protected routes with authentication middleware
Object.entries(protectedRoutes).forEach(([path, route]) => {
  SystemRouter.use(path, authenticateToken, route);
});

export default SystemRouter;
