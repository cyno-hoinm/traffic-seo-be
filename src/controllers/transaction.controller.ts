import { Request, Response } from "express";
import statusCode from "../constants/statusCode"; // Adjust path
import {
  createTransactionRepo,
  getListTransactionRepo,
} from "../repositories/transaction.repository"; // Adjust path
import { ResponseType } from "../types/Response.type"; // Adjust path
import { TransactionAttributes } from "../interfaces/Transaction.interface";
import { TransactionStatus } from "../enums/transactionStatus.enum";

// Create a new transaction
export const createTransaction = async (
  req: Request,
  res: Response<ResponseType<TransactionAttributes>>
): Promise<void> => {
  try {
    const { walletId, amount, status } = req.body;

    if (!walletId || amount === undefined || isNaN(amount) || !status) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All fields (walletId, amount, status) are required",
        error: "Missing or invalid field",
      });
      return;
    }

    if (![TransactionStatus.PAY, TransactionStatus.REFUND].includes(status)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (PAY, REFUND)",
        error: "Invalid field",
      });
      return;
    }

    const transaction = await createTransactionRepo({
      walletId,
      amount,
      status,
    });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Transaction created successfully",
      data: {
        id: transaction.id,
        walletId: transaction.walletId,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

// Get list of transactions with filters
export const getListTransaction = async (
  req: Request,
  res: Response<ResponseType<TransactionAttributes[]>>
): Promise<void> => {
  try {
    const { walletId, status, start_date, end_date } = req.query;

    const filters: {
      walletId?: number;
      status?: TransactionStatus;
      start_date?: Date;
      end_date?: Date;
    } = {};

    if (walletId) filters.walletId = Number(walletId);
    if (status) {
      if (
        ![TransactionStatus.PAY, TransactionStatus.REFUND].includes(
          status as TransactionStatus
        )
      ) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid status is required (PAY, REFUND)",
          error: "Invalid field",
        });
        return;
      }
      filters.status = status as TransactionStatus;
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

    const transactions = await getListTransactionRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Transactions retrieved successfully",
      data: transactions.map((transaction: TransactionAttributes) => ({
        id: transaction.id,
        walletId: transaction.walletId,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};
