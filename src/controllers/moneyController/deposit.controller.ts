import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getDepositListRepo,
  createDepositRepo,
  getDepositByIdRepo,
  getDepositByOrderIdRepo,
} from "../../repositories/moneyRepo/deposit.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { DepositAttributes } from "../../interfaces/Deposit.interface";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { uuidToNumber, uuIDv4 } from "../../utils/generate";
import payOSPaymentMethod from "../../config/payOs.config";
import { CreateInvoiceInput } from "../../interfaces/Oxapay.interface";
import { oxapayConfig } from "../../config/oxapay.config";
import { generateInvoice } from "../../services/oxapay.service";

// Get deposit list with filters and pagination
export const getDepositList = async (
  req: Request,
  res: Response<ResponseType<{ deposits: DepositAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { userId, start_date, end_date, status, page, limit } = req.body;

    const filters: {
      userId?: number;
      start_date?: Date;
      end_date?: Date;
      status?: DepositStatus;
      page?: number;
      limit?: number;
    } = {};
    filters.page =
      typeof page === "string" && !isNaN(parseInt(page)) ? parseInt(page) : 0;
    filters.limit =
      typeof limit === "string" && !isNaN(parseInt(limit))
        ? parseInt(limit)
        : 0;
    if (userId) filters.userId = Number(userId);
    if (
      status &&
      Object.values(DepositStatus).includes(status as DepositStatus)
    ) {
      filters.status = status as DepositStatus;
    } else if (status) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (PENDING, COMPLETED, FAILED)",
        error: "Invalid field",
      });
      return;
    }
    if (start_date) {
      const start = new Date(start_date as string);
      if (isNaN(start.getTime())) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid start_date format",
          error: "Invalid field",
        });
        return;
      }
      filters.start_date = start;
    }
    if (end_date) {
      const end = new Date(end_date as string);
      if (isNaN(end.getTime())) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid end_date format",
          error: "Invalid field",
        });
        return;
      }
      filters.end_date = end;
    }

    const { deposits, total } = await getDepositListRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Deposits retrieved successfully",
      data: {
        deposits: deposits.map((deposit: DepositAttributes) => ({
          id: deposit.id,
          userId: deposit.userId,
          orderId: deposit.orderId,
          paymentMethodId: deposit.paymentMethodId,
          voucherId: deposit.voucherId,
          amount: deposit.amount,
          status: deposit.status,
          acceptedBy: deposit.acceptedBy,
          createdAt: deposit.createdAt,
          updatedAt: deposit.updatedAt,
        })),
        total,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
};

// Create a new deposit
export const createDeposit = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { userId, voucherId, amount, paymentMethodId, currency } = req.body;
    const orderId = uuIDv4();
    const createdBy = req.data?.id || 0; // Get createdBy from authenticated user
    if (
      !userId ||
      !voucherId ||
      amount === undefined ||
      isNaN(amount) ||
      paymentMethodId === undefined
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message:
          "All fields (userId, voucherId, amount, paymentMethodId) are required",
        error: "Missing or invalid field",
      });
      return;
    }
    switch (paymentMethodId) {
      case 1: // USDT
        {
          const data: CreateInvoiceInput = {
                merchant: oxapayConfig.merchant,
                amount: amount,
                currency: currency,
                lifeTime: parseInt(String(oxapayConfig.lifeTime)),
                feePaidByPayer: parseInt(String(oxapayConfig.feePaidByPayer)),
                underPaidCover:  parseInt(String(oxapayConfig.underPaidCover)),
                callbackUrl: `${process.env.DEV_URL}/success?orderId=${uuidToNumber(
                  orderId
                )}&userId=${userId}&voucherId=${voucherId}&paymentMethodId=${paymentMethodId}&amount=${amount}&createdBy=${createdBy}`,
                returnUrl: "/"
          }
          console.log(data)
          const result = await generateInvoice(data)
          res.status(statusCode.OK).json({
            message: "Create link payment USDT successfully",
            status: true,
            data: {
              ...result,
              checkoutUrl: result.payLink
            }
          })
          return
        }
      case 3: // PAYOS
        {
          const body = {
            orderCode: uuidToNumber(orderId), // Use deposit ID as orderCode
            amount: Math.floor(amount),
            description: "Charge money",
            items: [
              {
                name: "Charge money",
                quantity: 1,
                price: Math.floor(amount),
              },
            ],
            cancelUrl: `${process.env.DEV_URL}/cancel?orderId=${uuidToNumber(
              orderId
            )}&userId=${userId}&voucherId=${voucherId}&paymentMethodId=${paymentMethodId}&amount=${amount}&createdBy=${createdBy}`,
            returnUrl: `${process.env.DEV_URL}/success?orderId=${uuidToNumber(
              orderId
            )}&userId=${userId}&voucherId=${voucherId}&paymentMethodId=${paymentMethodId}&amount=${amount}&createdBy=${createdBy}`,
          };
          const response = await payOSPaymentMethod.createPaymentLink(body);
          res.status(statusCode.CREATED).json({
            status: true,
            message: "Create link payment VietQR successfully",
            data: {
              checkoutUrl: response.checkoutUrl,
            },
          });
          return;
        }

      default:
        {
          res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
             "Invalid Payment Method",
            error: "Invalid Payment Method",
          });
          return;
        }
    }

  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating deposit",
      error: error.message,
    });
  }
};

export const getDepositById = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<DepositAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const depositId = Number(id);
    if (isNaN(depositId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid deposit ID",
        error: "Invalid field",
      });
      return;
    }

    const deposit = await getDepositByIdRepo(depositId);
    if (!deposit) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Deposit not found",
        error: "Not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Deposit retrieved successfully",
      data: deposit,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposit",
      error: error.message,
    });
  }
};

export const getDepositByOrderId = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<DepositAttributes>>
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.data?.id || 0; // Get userId from authenticated user

    const deposit = await getDepositByOrderIdRepo(orderId,userId);
    if (!deposit) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Deposit not found",
        error: "Not found",
      });
      return;
    }

    if (deposit.userId !== userId) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You do not have permission to access this deposit",
        error: "Forbidden",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Deposit retrieved successfully",
      data: deposit,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching deposit",
      error: error.message,
    });
  }
};
