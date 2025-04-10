import express from "express";
import userRoute from "./user.route";
import permissionRoute from "./permission.route";
import roleRoute from "./role.route";
import rolePermissionRoute from "./role-permission.route"

const adminRouter = express.Router();

adminRouter.use("/users", userRoute);
adminRouter.use("/permissions", permissionRoute);
adminRouter.use("/roles", roleRoute);
adminRouter.use("/role-permissions", rolePermissionRoute);

export default adminRouter;
