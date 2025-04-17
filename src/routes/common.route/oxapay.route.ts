import express from "express";
import { createInvoice, withDraw, checkMyIP } from "../../controllers/moneyController/oxapay.controller";

const router = express.Router();

router.post("/createInvoice",createInvoice);
router.post("/createPayout",withDraw);
router.get("/getMyIP",checkMyIP);

export default router;
