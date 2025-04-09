import express from "express";
import userRoute from "./user.route";


const adminRouter = express.Router();

adminRouter.use("/users", userRoute);

export default adminRouter;
