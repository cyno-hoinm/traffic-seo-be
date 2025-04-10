import express from "express";
import userRoute from "./user.route";
import authRoute from "../common.route/auth.route"

const clientRouter = express.Router();

clientRouter.use("/", authRoute);
clientRouter.use("/users", userRoute);

export default clientRouter;
