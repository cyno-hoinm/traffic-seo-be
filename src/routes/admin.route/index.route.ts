import express from "express";
import userRoute from "./user.route";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../../swagger";

const adminRouter = express.Router();

adminRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
adminRouter.use("/users", userRoute);

export default adminRouter;
