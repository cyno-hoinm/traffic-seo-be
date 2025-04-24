import { Request, Response } from "express";
import { PayOsType } from "../../types/PayOs.type";
import { parseChargeMoneyString } from "../../utils/utils";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";
import statusCode from "../../constants/statusCode";

export async function handlePayOsWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Extract signature and body from request
    const { data, signature } = req.body;
    const returnData: PayOsType = data;

    // Check if signature is provided
    if (!signature) {
      console.error("Missing webhook signature");
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Missing signature" });
      return;
    }

    // Parse description
    const parseData = parseChargeMoneyString(returnData.description);
    if (
      parseData.createdBy == null ||
      parseData.userId == null ||
      parseData.voucherId == null
    ) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Invalid value" });
      return;
    }

    // Create deposit
    await createDepositRepo({
      createdBy: parseData.createdBy,
      amount: returnData.amount,
      orderId: returnData.orderCode.toString(),
      paymentMethodId: 3,
      status: DepositStatus.COMPLETED,
      userId: parseData.userId,
      voucherId: parseData.voucherId,
    });

    // Respond to PayOS
    res
      .status(statusCode.OK)
      .json({ status: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
}
