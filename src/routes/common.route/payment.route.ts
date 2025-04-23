import express, { Request, Response } from "express";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";
import crypto from "crypto";

const router = express.Router();

const PAYOS_WEBHOOK_SECRET = process.env.PAY_OS_CHECKSUM || '';

router.post('/payos-webhook', express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract signature and body from request
    // const signature = req.headers['x-payos-signature'] as string | undefined;
    const body = req.body;

    // Check if signature is provided
    // if (!signature) {
    //   console.error('Missing webhook signature');
    //   res.status(401).json({ status: false, message: 'Missing signature' });
    //   return;
    // }

    // Verify webhook signature
    const computedSignature = crypto
      .createHmac('sha256', PAYOS_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    // if (computedSignature !== signature) {
    //   console.error('Invalid webhook signature');
    //   res.status(401).json({ status: false, message: 'Invalid signature' });
    //   return;
    // }

    // Process webhook data
    const { orderCode, status, amount, description } = body;

    // Handle payment status
    switch (status) {
      case 'PAID':
        // Update your database or perform actions for successful payment
        console.log(`Payment successful for orderCode: ${orderCode}, amount: ${amount}`);
        // Example: await updateOrderStatus(orderCode, 'PAID');
        break;
      case 'CANCELLED':
        // Handle cancelled payment
        console.log(`Payment cancelled for orderCode: ${orderCode}`);
        // Example: await updateOrderStatus(orderCode, 'CANCELLED');
        break;
      case 'PENDING':
        // Handle pending payment (optional)
        console.log(`Payment pending for orderCode: ${orderCode}`);
        // Example: await updateOrderStatus(orderCode, 'PENDING');
        break;
      default:
        console.log(`Unknown status for orderCode: ${orderCode}`);
    }

    // Respond to PayOS to acknowledge receipt
    res.status(200).json({ status: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
});

export default router;
