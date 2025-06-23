// Admin routes
import userRoute from "./commonRoute/user.route";
import permissionRoute from "./roleRoute/permission.route";
import roleRoute from "./roleRoute/role.route";
import rolePermissionRoute from "./roleRoute/role-permission.route";
import countryRoute from "./coreRoute/country.route";
import walletRoute from "./moneyRoute/wallet.route";
import voucherRoute from "./moneyRoute/voucher.route";
import transactionRoute from "./moneyRoute/transaction.route";
import depositRoute from "./moneyRoute/deposit.route";
import keywordRoute from "./coreRoute/keyword.route";
import linkRoute from "./coreRoute/link.route";
import reportRoute from "./coreRoute/report.route";
import botRoute from "./botRoute/bot.route";
import oxapayRoute from "./moneyRoute/oxapay.route"
import configRoute from "./commonRoute/config.route"
import agencyRoute from "./coreRoute/agency.route"
import packageRoute from "./moneyRoute/package.route"
import reportUserRoute from "./commonRoute/reportUser.route"
// Common routes
import authRoute from "./commonRoute/auth.route";
import notificationRoute from "./commonRoute/notification.route";
import campaignRoute from "./coreRoute/campaign.route";
import directLinkRoute from "./coreRoute/directLink.route";
import googleMapsReviewRoute from "./coreRoute/googleMapReview.route"
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
  "/agencies": agencyRoute,
  "/packages": packageRoute,
  "/report-user": reportUserRoute,
  "/direct-link": directLinkRoute,
  "google-maps-review": googleMapsReviewRoute
};
