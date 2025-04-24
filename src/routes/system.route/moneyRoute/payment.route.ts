import express from "express";
import { handlePayOsWebhook } from "../../../controllers/moneyController/payOs.controller";

const router = express.Router();

router.post("/payos-webhook", express.json(), handlePayOsWebhook);

export default router;
