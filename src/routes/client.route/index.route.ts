import express from "express";
// import userRoute from "./user.route";
// import authRoute from "../common.route/auth.route"
import oxapayRoute from "../common.route/oxapay.route"
// import notificationRoute from "../common.route/notification.route"
// import campaignRoute from "../common.route/campaign.route"
const clientRouter = express.Router();

// clientRouter.use("/auth", authRoute);
clientRouter.use("/oxapay", oxapayRoute)
// clientRouter.use("/users", userRoute);
// clientRouter.use("/notifications", notificationRoute);
// clientRouter.use("/campaigns", campaignRoute);

export default clientRouter;
