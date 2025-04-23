import express, { Request, Response } from "express";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";
import crypto from "crypto";
import { generateSignature } from "../../utils/generate";
import { PayOsType } from "../../types/PayOs.type";

const router = express.Router();

export const PAYOS_WEBHOOK_SECRET = process.env.PAY_OS_CHECKSUM || "";

// Function to stringify JSON with sorted keys
function sortedStringify(obj: any) {
  if (typeof obj !== "object" || obj === null) {
    return JSON.stringify(obj);
  }
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: any = {};
  sortedKeys.forEach((key: any) => {
    sortedObj[key] = obj[key];
  });
  return JSON.stringify(sortedObj);
}

router.post(
  "/payos-webhook",
  express.json(),
  async (req: Request, res: Response): Promise<any> => {
    try {
      // Log the incoming webhook for debugging
      console.log("Webhook received:", {
        headers: req.headers,
        body: req.body,
      });

      // Extract signature and body from request
      const { code, success, data, desc, signature } = req.body;

      // Check if signature is provided
      if (!signature) {
        console.error("Missing webhook signature");
        return res
          .status(401)
          .json({ status: false, message: "Missing signature" });
      }

      // Get webhook secret
      const webhookSecret = PAYOS_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("Webhook secret key not configured");
        return res
          .status(500)
          .json({ status: false, message: "Server configuration error" });
      }

      // Method 1: Signature based on entire data object
      const fullPayload = sortedStringify(data);
      const fullSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(fullPayload)
        .digest("hex");

      console.log("Full payload:", fullPayload);
      console.log("Full generated signature:", fullSignature);

      // Method 2: Signature based on subset of data fields (matching payment link)
      const subsetData = {
        amount: data.amount,
        description: data.description,
        orderCode: data.orderCode,
        paymentLinkId: data.paymentLinkId,
        transactionDateTime: data.transactionDateTime,
        reference: data.reference,
        currency: data.currency,
      };
      const subsetPayload = sortedStringify(subsetData);
      const subsetSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(subsetPayload)
        .digest("hex");

      console.log("Subset payload:", subsetPayload);
      console.log("Subset generated signature:", subsetSignature);

      // Compare signatures
      const receivedSignature = signature;
      console.log("Received signature:", receivedSignature);

      let signatureValid = false;
      if (fullSignature === receivedSignature) {
        console.log("Signature matched using full data");
        signatureValid = true;
      } else if (subsetSignature === receivedSignature) {
        console.log("Signature matched using subset data");
        signatureValid = true;
      }

      // For extra security, use timingSafeEqual
      const receivedSignatureBuffer = Buffer.from(receivedSignature, "hex");
      const fullSignatureBuffer = Buffer.from(fullSignature, "hex");
      const subsetSignatureBuffer = Buffer.from(subsetSignature, "hex");

      if (
        receivedSignatureBuffer.length === fullSignatureBuffer.length &&
        crypto.timingSafeEqual(receivedSignatureBuffer, fullSignatureBuffer)
      ) {
        console.log("Secure signature matched using full data");
        signatureValid = true;
      } else if (
        receivedSignatureBuffer.length === subsetSignatureBuffer.length &&
        crypto.timingSafeEqual(receivedSignatureBuffer, subsetSignatureBuffer)
      ) {
        console.log("Secure signature matched using subset data");
        signatureValid = true;
      }

      if (!signatureValid) {
        console.error("Invalid webhook signature");
        return res
          .status(401)
          .json({ status: false, message: "Invalid signature" });
      }

      // Process the webhook data (e.g., update order status)
      console.log("Webhook data validated:", data);

      // Example: Update your database based on data
      if (success && data.code === "00") {
        // Handle successful payment
        // e.g., Update order status for orderCode: data.orderCode
      }

      // Respond to PayOS to acknowledge receipt
      return res
        .status(200)
        .json({ status: true, message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res
        .status(500)
        .json({ status: false, message: "Internal server error" });
    }
  }
);

export default router;
