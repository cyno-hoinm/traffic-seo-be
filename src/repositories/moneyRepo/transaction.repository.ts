import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { sequelizeSystem, Transaction, Wallet } from "../../models/index.model";
import { Op } from "sequelize";
import { ErrorType } from "../../types/Error.type";
import { Transaction as SequelizeTransaction } from "sequelize";

export const createTransactionRepo = async (
  data: {
    walletId: number;
    amount: number;
    status: TransactionStatus;
  },
  _transaction?: SequelizeTransaction
): Promise<Transaction> => {
  try {
    const wallet = await Wallet.findByPk(data.walletId);
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found");
    }

    // Ensure balance and amount are numbers
    const balance = parseFloat(wallet.balance.toString()); // Convert to number
    const amount = parseFloat(data.amount.toString()); // Ensure amount is a number

    if (isNaN(balance) || isNaN(amount)) {
      throw new ErrorType("InvalidDataError", "Balance or amount is invalid");
    }

    if (amount < 0) {
      throw new ErrorType("InvalidAmountError", "Amount cannot be negative");
    }

    const transaction = await sequelizeSystem.transaction(async (t) => {
      const newTransaction = await Transaction.create(data, { transaction: t });

      if (data.status === TransactionStatus.PAY) {
        if (balance < amount) {
          throw new ErrorType(
            "InsufficientFundsError",
            "Insufficient wallet balance"
          );
        }
        wallet.balance = balance - amount;
      } else if (
        data.status === TransactionStatus.REFUND ||
        data.status === TransactionStatus.CHARGE
      ) {
        wallet.balance = balance + amount;
      } else {
        throw new ErrorType(
          "InvalidStatusError",
          "Status must be CHARGE, REFUND, or PAY"
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

export const getListTransactionRepo = async (filters: {
  walletId?: number;
  status?: TransactionStatus;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<Transaction[]> => {
  try {
    const where: any = { isDeleted: false };

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

    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
    };
    
    if (filters.page && filters.limit && filters.page > 0 && filters.limit > 0) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const transactions = await Transaction.findAll(queryOptions);
    return transactions;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};