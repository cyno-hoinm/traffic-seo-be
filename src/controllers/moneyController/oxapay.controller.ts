import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import { CreateInvoiceInput, CreatePayoutInput } from "../../interfaces/Oxapay.interface";
import { oxapayConfig } from "../../config/oxapay.config";
import { generateInvoice, generatePayout, getMyIP } from "../../services/oxapay.service";

export const createInvoice = async (
  req: Request,
  res: Response): Promise<void> => {
  try {
    const { amount, currency } = req.body

    const data: CreateInvoiceInput = {
      merchant: oxapayConfig.merchant,
      amount: amount,
      currency: currency,
      lifeTime: parseInt(String(oxapayConfig.lifeTime)),
      feePaidByPayer: parseInt(String(oxapayConfig.feePaidByPayer)),
      underPaidCover:  parseInt(String(oxapayConfig.underPaidCover)),
      callbackUrl: "",
      returnUrl: "/"
    }

    const result = await generateInvoice(data)
    res.status(statusCode.OK).json({
      message: "",
      status: true,
      data: result
    })

  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
}

export const withDraw = async (
  req: Request,
  res: Response): Promise<void> => {
  try {
    const { amount, currency, description } = req.body
    const data: CreatePayoutInput = {
      key: oxapayConfig.payoutKey,
      callbackUrl: "",
      address: oxapayConfig.payoutAddress,
      currency: currency,
      amount: amount,
      description: description || ""
    }
    console.log(data)
    const result = await generatePayout(data)
    res.status(statusCode.OK).json({
      message: "",
      status: true,
      data: result
    })

  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
}

export const checkMyIP = async (
  req: Request,
  res: Response): Promise<void> => {
  try {


    const result = await getMyIP()
    res.status(statusCode.OK).json({
      message: "",
      status: true,
      data: result
    })

  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
}

// export const callback
