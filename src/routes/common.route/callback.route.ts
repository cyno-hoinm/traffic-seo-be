import express, { Request, Response } from "express";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { oxapayConfig } from "../../config/oxapay.config";
import crypto from "crypto";

const router = express.Router();

router.post("/oxapay", async (req: Request, res: Response) => {
  try {
    const rawBody = (req as any).rawBody;
    console.log('RawBody: ',rawBody)
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

    console.log('✅ Valid OxaPay callback:', data);

    // xử lý logic
    console.log('Test oxapay callback!!!',data)

    res.status(200).send('ok');
  } catch (err: any) {
    console.error("❌ Callback error:", err);
    res.status(500).send("Callback processing error");
  }
});

export default router
