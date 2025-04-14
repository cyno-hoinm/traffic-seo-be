import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { protectedRoutes } from "./config";

const adminRouter = express.Router();

// Register protected routes with authentication middleware
Object.entries(protectedRoutes).forEach(([path, route]) => {
  adminRouter.use(path, authenticateToken, route);
});

export default adminRouter;
