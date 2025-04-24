import express from "express";

import { handleOxaPayWebhook } from "../../controllers/moneyController/oxapay.controller";

const router = express.Router();

router.post("/oxapay", handleOxaPayWebhook);

export default router;
