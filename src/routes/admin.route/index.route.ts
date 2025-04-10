import express from "express";
import userRoute from "./user.route";
import permissionRoute from "./permission.route";
import roleRoute from "./role.route";
import rolePermissionRoute from "./role-permission.route"
import authRoute from "../common.route/auth.route"
import countryRoute from "./country.route"
import walletRoute from "./wallet.route"
import voucherRoute from "./voucher.route"

const adminRouter = express.Router();

adminRouter.use("/", authRoute);
adminRouter.use("/users", userRoute);
adminRouter.use("/countries", countryRoute);
adminRouter.use("/vouchers", voucherRoute);
adminRouter.use("/wallets", walletRoute);
adminRouter.use("/permissions", permissionRoute);
adminRouter.use("/roles", roleRoute);
adminRouter.use("/role-permissions", rolePermissionRoute);

export default adminRouter;
