import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { protectedRoutes, publicRoutes } from "./config";

const adminRouter = express.Router();

Object.entries(publicRoutes).forEach(([path, route]) => {
  adminRouter.use(path, route);
});

// Register protected routes with authentication middleware
Object.entries(protectedRoutes).forEach(([path, route]) => {
  adminRouter.use(path, authenticateToken, route);
});

export default adminRouter;