import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getDepositListRepo,
  createDepositRepo,
  updateDepositRepo,
} from "../../repositories/moneyRepo/deposit.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { DepositAttributes } from "../../interfaces/Deposit.interface";
import { DepositStatus } from "../../enums/depositStatus.enum";

// Get deposit list with filters and pagination
export const getDepositList = async (
  req: Request,
  res: Response<ResponseType<{ deposits: DepositAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { userId, start_date, end_date, status, page, limit } =
      req.query;

    const filters: {
      userId?: number;
      start_date?: Date;
      end_date?: Date;
      status?: DepositStatus;
      page?: number;
      limit?: number;
    } = {
    };
    filters.page = typeof page === "string" && !isNaN(parseInt(page)) ? parseInt(page) : 0;
    filters.limit = typeof limit === "string" && !isNaN(parseInt(limit)) ? parseInt(limit) : 0;
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
  req: Request,
  res: Response<ResponseType<DepositAttributes>>
): Promise<void> => {
  try {
    const { userId, voucherId, amount, paymentMethodId } = req.body;

    const createdBy = "system"; // Assuming token provides username

    if (
      !userId ||
      !voucherId ||
      amount === undefined ||
      isNaN(amount)
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All fields (userId, voucherId, amount, method) are required",
        error: "Missing or invalid field",
      });
      return;
    }

    const deposit = await createDepositRepo({
      createdBy,
      userId,
      paymentMethodId,
      voucherId,
      amount,
    });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Deposit created successfully",
      data: {
        id: deposit.id,
        userId: deposit.userId,
        paymentMethodId: deposit.paymentMethodId,
        voucherId: deposit.voucherId,
        amount: deposit.amount,
        status: deposit.status,
        acceptedBy: deposit.acceptedBy,
        createdAt: deposit.createdAt,
        updatedAt: deposit.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating deposit",
      error: error.message,
    });
  }
};

// Update deposit
export const updateDeposit = async (
  req: Request,
  res: Response<ResponseType<DepositAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { acceptedBy, status } = req.body;

    if (!acceptedBy || !status) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "acceptedBy and status are required",
        error: "Missing required field",
      });
      return;
    }

    if (![DepositStatus.COMPLETED, DepositStatus.FAILED].includes(status)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Status must be COMPLETED or FAILED",
        error: "Invalid field",
      });
      return;
    }

    const deposit = await updateDepositRepo(Number(id), { acceptedBy, status });
    if (!deposit) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Deposit not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Deposit updated successfully",
      data: {
        id: deposit.id,
        userId: deposit.userId,
        paymentMethodId: deposit.paymentMethodId,
        voucherId: deposit.voucherId,
        amount: deposit.amount,
        status: deposit.status,
        acceptedBy: deposit.acceptedBy,
        createdAt: deposit.createdAt,
        updatedAt: deposit.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error updating deposit",
      error: error.message,
    });
  }
};
