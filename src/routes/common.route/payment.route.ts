import express, { Request, Response } from "express";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";
import crypto from "crypto";
import { generateSignature } from "../../utils/generate";

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

      // Check if signature is provided
      if (!signature) {
        console.error("Missing webhook signature");
        res.status(401).json({ status: false, message: "Missing signature" });
        return;
      }
      console.log("ordercode after :", data.orderCode);
      // Verify webhook signature
      const computedSignature = generateSignature(
        data.orderCode,
        PAYOS_WEBHOOK_SECRET
      );
      console.log(computedSignature);
      if (computedSignature !== signature) {
        console.error("Invalid webhook signature");
        res.status(401).json({ status: false, message: "Invalid signature" });
        return;
      }

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
