import express from "express";
import userRoute from "./user.route";
import permissionRoute from "./permission.route";
import roleRoute from "./role.route";
import rolePermissionRoute from "./role-permission.route"
import authRoute from "../common.route/auth.route"
import countryRoute from "./country.route"
import walletRoute from "./wallet.route"
import voucherRoute from "./voucher.route"
import transactionRoute from "./transaction.route"
import notificationRoute from "../common.route/notification.route"
import depositRoute from "./deposit.route"
import campaignRoute from "../common.route/campaign.route"
import keyWordRoute from "./keyword.route"
import linkRoute from "./link.route"
const adminRouter = express.Router();

adminRouter.use("/auth", authRoute);
adminRouter.use("/users", userRoute);
adminRouter.use("/countries", countryRoute);
adminRouter.use("/vouchers", voucherRoute);
adminRouter.use("/transactions", transactionRoute);
adminRouter.use("/deposits", depositRoute);
adminRouter.use("/wallets", walletRoute);
adminRouter.use("/permissions", permissionRoute);
adminRouter.use("/notifications", notificationRoute);
adminRouter.use("/keywords", keyWordRoute);
adminRouter.use("/links", linkRoute);
adminRouter.use("/roles", roleRoute);
adminRouter.use("/campaigns", campaignRoute);
adminRouter.use("/role-permissions", rolePermissionRoute);

export default adminRouter;
