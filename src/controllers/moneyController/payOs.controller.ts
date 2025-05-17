import { Request, Response } from "express";
import { PayOsType } from "../../types/PayOs.type";
import { parseChargeMoneyString } from "../../utils/utils";
import {
  // createDepositByPackageRepo,
  createDepositRepo,
} from "../../repositories/moneyRepo/deposit.repository";
import { DepositStatus } from "../../enums/depositStatus.enum";
import statusCode from "../../constants/statusCode";
// import { getPackageByIdRepo } from "../../repositories/moneyRepo/packge.deposit";
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
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Missing signature" });
      return;
    }

    // Parse description
    const parseData = parseChargeMoneyString(returnData.description);
    console.log(parseData);
    // const pkg = await getPackageByIdRepo(parseData.packageId);
    // if (pkg) {
    //   await createDepositByPackageRepo({
    //     createdBy: parseData.createdBy,
    //     userId: parseData.userId,
    //     packageId: pkg.id,
    //     orderId: returnData.orderCode.toString(),
    //     status: DepositStatus.COMPLETED,
    //   });
    //   res
    //     .status(statusCode.OK)
    //     .json({ status: true, message: "Webhook processed successfully" });
    //   return;
    // } else 
    {
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

      res
        .status(statusCode.OK)
        .json({ status: true, message: "Webhook processed successfully" });
      return;
    }
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      details: error,
    });
    return;
  }
}
