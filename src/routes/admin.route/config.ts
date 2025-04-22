// Admin routes
import userRoute from "./user.route";
import permissionRoute from "./permission.route";
import roleRoute from "./role.route";
import rolePermissionRoute from "./role-permission.route";
import countryRoute from "./country.route";
import walletRoute from "./wallet.route";
import voucherRoute from "./voucher.route";
import transactionRoute from "./transaction.route";
import depositRoute from "./deposit.route";
import keywordRoute from "./keyword.route";
import linkRoute from "./link.route";
import reportRoute from "./report.route";
import botRoute from "./bot.route";
import oxapayRoute from "../common.route/oxapay.route"
import configRoute from "../common.route/config.route"
// Common routes
import authRoute from "../common.route/auth.route";
import notificationRoute from "../common.route/notification.route";
import campaignRoute from "../common.route/campaign.route";

export const publicRoutes = {
  "/auth": authRoute,
};

export const protectedRoutes = {
  "/users": userRoute,
  "/countries": countryRoute,
  "/vouchers": voucherRoute,
  "/transactions": transactionRoute,
  "/deposits": depositRoute,
  "/wallets": walletRoute,
  "/permissions": permissionRoute,
  "/notifications": notificationRoute,
  "/keywords": keywordRoute,
  "/links": linkRoute,
  "/roles": roleRoute,
  "/campaigns": campaignRoute,
  "/role-permissions": rolePermissionRoute,
  "/report": reportRoute,
  "/bot" : botRoute,
  "/oxapay": oxapayRoute,
  "/configs": configRoute,
};
