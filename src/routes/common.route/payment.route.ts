import express, { Request, Response } from "express";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";

const router = express.Router();

router.get("/cancel", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const { orderId, userId, voucherId, paymentMethodId, amount, createdBy } =
      req.query;
    console.log(userId, orderId, voucherId, paymentMethodId, amount, createdBy);
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
    res.status(200).json({
      message: "Deposit cancelled successfully",
      // data: result,
    });
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
    console.log(userId, orderId, voucherId, paymentMethodId, amount, createdBy);

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

    await createDepositRepo({
      createdBy: parsedCreatedBy,
      userId: Number(userId), // Ensure userId is also a number
      voucherId: voucherId ? Number(voucherId) : 0, // Handle optional fields
      amount: Number(amount), // Ensure amount is a number
      paymentMethodId: parsedPaymentMethodId, // Use parsed value
      orderId: orderId?.toString() || "", // Handle optional fields
      status: DepositStatus.COMPLETED, // Set status to COMPLETED
    });

    res.status(200).json({
      message: "Deposit completed successfully",
    });
  } catch (error: any) {
    console.error("Error processing deposit:", error);
    res
      .status(500)
      .json({ error: "Failed to process deposit", detail: error.message });
  }
});
export default router;