import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import {
  CreateInvoiceInput,
  CreatePayoutInput,
} from "../../interfaces/Oxapay.interface";
import { oxapayConfig } from "../../config/oxapay.config";
import {
  generateInvoice,
  generatePayout,
  getCurrenciesService,
  getMyIP,
} from "../../services/oxapay.service";
import { decodeAndDecompress } from "../../utils/generate";
import { createDepositRepo } from "../../repositories/moneyRepo/deposit.repository";
import crypto from "crypto";
import { DepositStatus } from "../../enums/depositStatus.enum";

export const createInvoice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, currency } = req.body;

    const data: CreateInvoiceInput = {
      amount: amount,
      currency: currency,
      lifeTime: parseInt(String(oxapayConfig.lifeTime)),
      fee_paid_by_payer: parseInt(String(oxapayConfig.feePaidByPayer)),
      under_paid_cover: parseInt(String(oxapayConfig.underPaidCover)),
      thanks_message: "Auto Ranker!",
      callback_url: "",
      return_url: "/",
    };

    const result = await generateInvoice(data);
    res.status(statusCode.OK).json({
      message: "",
      status: true,
      data: result,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
};

export const getCurrencies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getCurrenciesService();

    res.status(statusCode.OK).json({
      message: "List currencies!",
      status: true,
      data: result.list,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching currencies!",
      error: error.message,
    });
  }
};

export const withDraw = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, description } = req.body;
    const data: CreatePayoutInput = {
      key: oxapayConfig.payoutKey,
      callbackUrl: "",
      address: oxapayConfig.payoutAddress,
      currency: currency,
      amount: amount,
      description: description || "",
    };

    const result = await generatePayout(data);
    res.status(statusCode.OK).json({
      message: "",
      status: true,
      data: result,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
};

export const checkMyIP = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getMyIP();
    res.status(statusCode.OK).json({
      message: "",
      status: true,
      data: result,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error get IP",
      error: error.message,
    });
  }
};

export async function handleOxaPayWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const rawBody = (req as any).rawBody;
    const hmacHeader = req.headers["hmac"] as string;

    if (!rawBody || !hmacHeader) {
      res.status(statusCode.BAD_REQUEST).send("Missing body or HMAC");
      return;
    }

    const data = req.body;
    const secret =
      data.type === "payout" ? oxapayConfig.payoutKey : oxapayConfig.merchant;
    const calculatedHmac = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (calculatedHmac !== hmacHeader) {
      res.status(statusCode.BAD_REQUEST).send("Invalid HMAC");
      return;
    }

    const orderInfo = decodeAndDecompress(data.order_id);
    await createDepositRepo({
      createdBy: orderInfo.userId,
      userId: orderInfo.userId,
      voucherId: orderInfo.voucherId,
      amount: data.amount,
      paymentMethodId: 1,
      orderId: data.track_id,
      status: DepositStatus.COMPLETED,
    });

    res.status(statusCode.OK).send("ok");
  } catch (err: any) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send("Callback processing error");
  }
}
