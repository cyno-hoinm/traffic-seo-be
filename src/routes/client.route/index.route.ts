import express from "express";
import userRoute from "./user.route";

const clientRouter = express.Router();

clientRouter.use("/users", userRoute);

export default clientRouter;
