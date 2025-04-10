import { TransactionStatus } from "../enums/transactionStatus.enum";
import { sequelizeSystem, Transaction, Wallet } from "../models/index.model";
import { Op } from "sequelize";
import { ErrorType } from "../types/Error.type";
import { Transaction as SequelizeTransaction } from "sequelize";
// Create a new transaction and update wallet balance
export const createTransactionRepo = async (
  data: {
    walletId: number;
    amount: number;
    status: TransactionStatus;
  },
  transaction?: SequelizeTransaction
): Promise<Transaction> => {
  try {
    const wallet = await Wallet.findByPk(data.walletId);
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found");
    }

    // Start a transaction to ensure atomicity
    const transaction = await sequelizeSystem.transaction(async (t) => {
      const newTransaction = await Transaction.create(data, { transaction: t });

      if (data.status === TransactionStatus.PAY) {
        if (wallet.balance < data.amount) {
          throw new ErrorType(
            "InsufficientFundsError",
            "Insufficient wallet balance"
          );
        }
        wallet.balance -= data.amount;
      } else if (data.status === TransactionStatus.REFUND) {
        wallet.balance += data.amount;
      } else {
        throw new ErrorType(
          "InvalidStatusError",
          "Status must be PAY or REFUND"
        );
      }

      await wallet.save({ transaction: t });
      return newTransaction;
    });

    return transaction;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get list of transactions with filters (walletId, status, date range)
export const getListTransactionRepo = async (filters: {
  walletId?: number;
  status?: TransactionStatus;
  start_date?: Date;
  end_date?: Date;
}): Promise<Transaction[]> => {
  try {
    const where: any = {};

    if (filters.walletId) {
      where.walletId = filters.walletId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.start_date || filters.end_date) {
      where.createdAt = {};
      if (filters.start_date) {
        where.createdAt[Op.gte] = filters.start_date;
      }
      if (filters.end_date) {
        where.createdAt[Op.lte] = filters.end_date;
      }
    }

    const transactions = await Transaction.findAll({ where });
    return transactions;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
