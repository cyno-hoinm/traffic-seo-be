import express, { Request, Response } from "express";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { oxapayConfig } from "../../config/oxapay.config";
import crypto from "crypto";

const router = express.Router();

router.get("/cancel", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const { orderId, userId, voucherId, paymentMethodId, amount, createdBy } =
      req.query;
    // Optional: Validate other parameters if needed
    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      res.status(400).json({ error: "Invalid or negative amount" });
      return;
    }
    if (userId && isNaN(Number(userId))) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    const parsedCreatedBy = createdBy ? Number(createdBy) : 0; // Explicitly convert to number
    const parsedPaymentMethodId = paymentMethodId ? Number(paymentMethodId) : 0; // Default to 0 if undefined
    const result = await createDepositRepo({
      createdBy: parsedCreatedBy,
      userId: Number(userId), // Ensure userId is also a number
      voucherId: voucherId ? Number(voucherId) : 0, // Handle optional fields
      amount: Number(amount), // Ensure amount is a number
      paymentMethodId: parsedPaymentMethodId, // Use parsed value
      orderId: orderId?.toString() || "", // Handle optional fields
      status: DepositStatus.FAILED, // Set status to REFUND
    });
    res.redirect(`${process.env.FRONT_END_URL}/en/deposit/failed`)
    return;
  } catch (error: any) {
    console.error("Error cancelling deposit:", error);
    res
      .status(500)
      .json({ error: "Failed to cancel deposit", detail: error.message });
  }
});
router.get("/success", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const { orderId, userId, voucherId, paymentMethodId, amount, createdBy } =
      req.query;

    // Optional: Validate other parameters if needed
    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      res.status(400).json({ error: "Invalid or negative amount" });
      return;
    }
    if (userId && isNaN(Number(userId))) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const parsedCreatedBy = createdBy ? Number(createdBy) : 0; // Explicitly convert to number
    const parsedPaymentMethodId = paymentMethodId ? Number(paymentMethodId) : 0; // Default to 0 if undefined

    const result = await createDepositRepo({
      createdBy: parsedCreatedBy,
      userId: Number(userId), // Ensure userId is also a number
      voucherId: voucherId ? Number(voucherId) : 0, // Handle optional fields
      amount: Number(amount), // Ensure amount is a number
      paymentMethodId: parsedPaymentMethodId, // Use parsed value
      orderId: orderId?.toString() || "", // Handle optional fields
      status: DepositStatus.COMPLETED, // Set status to COMPLETED
    });

    res.redirect(`${process.env.FRONT_END_URL}/en/deposit/${result.id}`)
  } catch (error: any) {
    console.error("Error processing deposit:", error);
    res
      .status(500)
      .json({ error: "Failed to process deposit", detail: error.message });
  }
});
router.post("/oxapay/callback", express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}), async (req: Request, res: Response) => {
  try {
    const rawBody = (req as any).rawBody?.toString();
    const hmacHeader = req.headers['hmac'] as string;

    if (!rawBody || !hmacHeader) {
      res.status(400).send('Missing body or HMAC');
      return
    }

    const data = req.body;
    const secret = data.type === 'payout' ? oxapayConfig.payoutKey  : oxapayConfig.merchant
    const calculatedHmac = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (calculatedHmac !== hmacHeader) {
      console.warn('❌ Invalid HMAC signature from OxaPay');
      res.status(400).send('Invalid HMAC');
      return
    }

    // console.log('✅ Valid OxaPay callback:', data);

    // xử lý logic
    // console.log('Test oxapay callback!!!',data)

    res.status(200).send('ok');
  } catch (err: any) {
    console.error("❌ Callback error:", err);
    res.status(500).send("Callback processing error");
  }
});
export default router;
