import express from "express";
import { createInvoice, withDraw } from "../../controllers/moneyController/oxapay.controller";

const router = express.Router();

router.post("/createInvoice",createInvoice);
router.post("/createPayout",withDraw);

export default router;
