import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getDepositListRepo,
  getDepositByIdRepo,
  getDepositByOrderIdRepo,
  createDepositRepo,
  checkUserUsedPaymentMethodGiftRepo,
} from "../../repositories/moneyRepo/deposit.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { DepositAttributes } from "../../interfaces/Deposit.interface";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { compressAndEncode, uuidToNumber, uuIDv4 } from "../../utils/generate";
import payOSPaymentMethod from "../../config/payOs.config";
import { CreateInvoiceInput } from "../../interfaces/Oxapay.interface";
import { oxapayConfig } from "../../config/oxapay.config";
import { generateInvoice } from "../../services/oxapay.service";
import { notificationType } from "../../enums/notification.enum";
import { createNotificationRepo } from "../../repositories/commonRepo/notification.repository";
import { getPackageByIdRepo } from "../../repositories/moneyRepo/packge.deposit";

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
    if (page) {
      filters.page = page;
    }
    if (limit) {
      filters.limit = limit;
    }
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
    const depositsWithPackages = await Promise.all(
      deposits.map(async (deposit: DepositAttributes) => {
        const packages = deposit.packageId ? await getPackageByIdRepo(deposit.packageId) : null;  
        return {
          id: deposit.id,
          userId: deposit.userId,
          username: deposit.users?.username,
          orderId: deposit.orderId,
          paymentMethods: deposit.paymentMethods,
          transactions: deposit.transactions,
          voucherId: deposit.voucherId,
          amount: deposit.amount,
          packageId: deposit.packageId,
          packageName: packages?.name,
          status: deposit.status,
          acceptedBy: deposit.acceptedBy,
          createdAt: deposit.createdAt,
          updatedAt: deposit.updatedAt,
        };
      })
    );

    res.status(statusCode.OK).json({
      status: true,
      message: "Deposits retrieved successfully",
      data: {
        deposits: depositsWithPackages,
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
    const { userId, voucherId, amount, paymentMethodId } = req.body;
    const orderId = uuIDv4();
    const createdBy = req.data?.id || 0; // Get createdBy from authenticated user
    const roleId = req.data?.role.id || 0;
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
      case 1: {
        // USDT
        const orderInfo = {
          userId,
          // createdBy,
          // paymentMethodId,
          voucherId,
        };

        const orderEncrypted = compressAndEncode(orderInfo);
        const data: CreateInvoiceInput = {
          amount: amount,
          currency: oxapayConfig.currency,
          lifeTime: parseInt(String(oxapayConfig.lifeTime)),
          fee_paid_by_payer: parseInt(String(oxapayConfig.feePaidByPayer)),
          under_paid_cover: parseInt(String(oxapayConfig.underPaidCover)),
          callback_url: `${process.env.DEV_URL}/callback/oxapay`,
          order_id: orderEncrypted,
          // callbackUrl: `${process.env.DEV_URL}/success?orderId=${uuidToNumber(
          //   orderId
          // )}&userId=${userId}&voucherId=${voucherId}&paymentMethodId=${paymentMethodId}&amount=${amount}&createdBy=${createdBy}`,
          return_url: "https://traffic-seo-fe-woad.vercel.app/",
          sandbox: oxapayConfig.sandbox,
        };

        const result = await generateInvoice(data);
        res.status(statusCode.OK).json({
          message: "Create link payment USDT successfully",
          status: true,
          data: {
            ...result,
            checkoutUrl: result.payment_url,
          },
        });
        return;
      }
      case 3: {
        // PAYOS
        const orderCodeUnique = uuidToNumber(orderId);
        const body: any = {
          orderCode: orderCodeUnique, // Use deposit ID as orderCode
          amount: Math.floor(amount),
          description: `v${voucherId}u${userId}c${createdBy}p0`,
          items: [
            {
              name: "Charge money",
              quantity: 1,
              price: Math.floor(amount),
            },
          ],
          cancelUrl: `${process.env.FRONT_END_URL}/en/deposit/failed`,
          returnUrl: `${process.env.FRONT_END_URL}/en/deposit/${orderCodeUnique}`,
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
      case 4: {
        // GIFT
        const orderCodeUnique = uuidToNumber(orderId);
        if (roleId === 1) {
          await createDepositRepo({
            createdBy: createdBy,
            amount: amount,
            orderId: orderCodeUnique.toString(),
            paymentMethodId: 4,
            status: DepositStatus.COMPLETED,
            userId: userId,
            voucherId: voucherId,
          });
          await createNotificationRepo({
            userId: [userId],
            name: "Gift",
            content: `You have received ${amount} credit`,
            type: notificationType.GIFT,
          });

          res.status(statusCode.OK).json({
            status: true,
            message: "Successfully charge credit for user",
            error: "Successfully charge credit for user",
          });
          return;
        } else {
          res.status(statusCode.FORBIDDEN).json({
            status: false,
            message: "You not have permission",
            error: "You not have permission",
          });
          return;
        }
      }
      default: {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid Payment Method",
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

    const deposit = await getDepositByOrderIdRepo(orderId, userId);
    if (userId != deposit?.userId) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You do not have permission to access this deposit",
        error: "Forbidden",
      });
      return;
    }
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

// Create a new deposit
export const trialUserDeposit = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { userId, voucherId, amount, paymentMethodId } = req.body;
    const orderId = uuIDv4();
    const createdBy = req.data?.id || 0;
    const roleId = req.data?.role.id || 0;
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
      case 4: {
        // GIFT
        const orderCodeUnique = uuidToNumber(orderId);
        if (roleId === 1) {
          await createDepositRepo({
            createdBy: createdBy,
            amount: amount,
            orderId: orderCodeUnique.toString(),
            paymentMethodId: 4,
            status: DepositStatus.COMPLETED,
            userId: userId,
            voucherId: voucherId,
          });
          await createNotificationRepo({
            userId: [userId],
            name: "Gift",
            content: `You have received ${amount} credit`,
            type: notificationType.GIFT,
          });

          res.status(statusCode.OK).json({
            status: true,
            message: "Successfully charge credit for user",
            error: "Successfully charge credit for user",
          });
          return;
        } else {
          res.status(statusCode.FORBIDDEN).json({
            status: false,
            message: "You not have permission",
            error: "You not have permission",
          });
          return;
        }
      }
      default: {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid Payment Method",
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

export const createTrialForUser = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { userId } = req.body;
    const createdBy = req.data?.id || 0;
    if (!userId) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "userId is required",
        error: "Missing userId field",
      });
      return;
    }

    const checkUserUsedPaymentMethodGift =
      await checkUserUsedPaymentMethodGiftRepo(userId);

    if (checkUserUsedPaymentMethodGift) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "User has already used their trial",
        error: "Trial already used",
      });
      return;
    }

    const orderId = uuIDv4();
    const orderCodeUnique = uuidToNumber(orderId);
    const amount = 10;
    const voucherId = 1;
    const paymentMethodId = 4;

    // Create deposit
    await createDepositRepo({
      createdBy: createdBy,
      amount: amount,
      orderId: orderCodeUnique.toString(),
      paymentMethodId: paymentMethodId,
      status: DepositStatus.COMPLETED,
      userId: userId,
      voucherId: voucherId,
    });

    // Create notification
    await createNotificationRepo({
      userId: [userId],
      name: "Trial Credit",
      content: `You have received ${amount} trial credit`,
      type: notificationType.GIFT,
    });

    res.status(statusCode.OK).json({
      status: true,
      message: "Successfully created trial for user",
      error: "Successfully created trial for user",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating trial",
      error: error.message,
    });
  }
};

export const createDepositByPackage = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  const { userId, packageId } = req.body;
  const orderId = uuIDv4();
  const createdBy = req.data?.id || 0; // Get createdBy from authenticated user
  const orderCodeUnique = uuidToNumber(orderId);
  const pkg = await getPackageByIdRepo(packageId);
  if (!pkg) {
    res.status(statusCode.BAD_REQUEST).json({
      status: false,
      message: "Package not found",
      error: "Package not found",
    });
  }
  const body: any = {
    orderCode: orderCodeUnique, // Use deposit ID as orderCode
    amount: Math.floor(pkg?.price || 0),
    description: `v0u${userId}c${createdBy}p${pkg?.id}`,
    items: [
      {
        name: "Charge money",
        quantity: 1,
        price: Math.floor(pkg?.price || 0),
      },
    ],
    cancelUrl: `${process.env.FRONT_END_URL}/en/deposit/failed`,
    returnUrl: `${process.env.FRONT_END_URL}/en/deposit/${orderCodeUnique}`,
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
};
