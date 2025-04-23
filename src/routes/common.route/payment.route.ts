import express, { Request, Response } from "express";
import { PayOsType } from "../../types/PayOs.type";
import { parseChargeMoneyString } from "../../utils/utils";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";

const router = express.Router();

export const PAYOS_WEBHOOK_SECRET = process.env.PAY_OS_CHECKSUM || "";

router.post(
  "/payos-webhook",
  express.json(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract signature and body from request
      console.log("Webhook received:", {
        headers: req.headers,
        body: req.body,
      });
      // const signature = req.headers['x-payos-signature'] as string | undefined;
      const { code, success, data, desc, signature } = req.body;
      const returnData: PayOsType = data;
      // Check if signature is provided
      if (!signature) {
        console.error("Missing webhook signature");
        res.status(401).json({ status: false, message: "Missing signature" });
        return;
      }
      const parseData = parseChargeMoneyString(returnData.description);
      if (parseData.createdBy == null|| parseData.userId == null || parseData.voucherId == null){
        res.status(401).json({ status: false, message: "Invalid value" });
        return;
      }
      await createDepositRepo({
        createdBy: parseData.createdBy,
        amount: returnData.amount,
        orderId: returnData.orderCode.toString(),
        paymentMethodId: 3,
        status: DepositStatus.COMPLETED,
        userId: parseData.userId,
        voucherId: parseData.voucherId,
      });
      // Respond to PayOS to acknowledge receipt
      res
        .status(200)
        .json({ status: true, message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  }
);

export default router;
