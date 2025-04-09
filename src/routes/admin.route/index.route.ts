import express from "express";
import { getListAdmin } from "../../controllers/Admin.controller";

const router = express.Router();

router.get("/", getListAdmin);

export default router;
