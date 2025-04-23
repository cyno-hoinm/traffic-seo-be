import { TransactionStatus } from "../../enums/transactionStatus.enum";
import {
  Deposit,
  sequelizeSystem,
  Transaction,
  User,
  Wallet,
} from "../../models/index.model";
import { Op } from "sequelize";
import { ErrorType } from "../../types/Error.type";
import { Transaction as SequelizeTransaction } from "sequelize";
import { TransactionType } from "../../enums/transactionType.enum";
import { TransactionAttributes } from "../../interfaces/Transaction.interface";

export const createTransactionRepo = async (
  data: {
    walletId: number;
    amount: number;
    status: TransactionStatus;
    type: TransactionType;
    referenceId?: string | null;
  },
  _transaction?: SequelizeTransaction
): Promise<TransactionAttributes> => {
  try {
    const wallet = await Wallet.findByPk(data.walletId, {
      transaction: _transaction,
    });
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found");
    }

    // Ensure balance and amount are numbers
    const balance = parseFloat(wallet.balance.toString());
    const amount = parseFloat(data.amount.toString());

    if (isNaN(balance) || isNaN(amount)) {
      throw new ErrorType("InvalidDataError", "Balance or amount is invalid");
    }

    if (amount < 0) {
      throw new ErrorType("InvalidAmountError", "Amount cannot be negative");
    }

    // Use provided transaction or start a new one
    const transaction = _transaction || (await sequelizeSystem.transaction());

    try {
      const newTransaction = await Transaction.create(
        {
          walletId: data.walletId,
          amount: data.amount,
          status: data.status,
          type: data.type,
          referenceId: data.referenceId,
          isDeleted: false,
        },
        {
          transaction,
          fields: [
            "walletId",
            "amount",
            "status",
            "type",
            "referenceId",
            "isDeleted",
          ],
        }
      );

      if (data.type === TransactionType.PAY_SERVICE) {
        if (balance < amount) {
          throw new ErrorType(
            "InsufficientFundsError",
            "Insufficient wallet balance"
          );
        }
        wallet.balance = balance - amount;
      } else if (data.type === TransactionType.DEPOSIT) {
        wallet.balance = balance + amount;
      } else {
        throw new ErrorType(
          "InvalidTypeError",
          "Transaction type must be PAY_SERVICE or DEPOSIT"
        );
      }

      await wallet.save({ transaction });

      // Commit only if we started the transaction
      if (!_transaction) {
        await transaction.commit();
      }

      return newTransaction;
    } catch (error) {
      // Rollback only if we started the transaction
      if (!_transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error: any) {
    throw new ErrorType(
      error.name || "TransactionCreationError",
      error.message || "Failed to create transaction",
      error.code
    );
  }
};

export const getListTransactionRepo = async (filters: {
  walletId?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<TransactionAttributes[]> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.walletId) {
      where.walletId = filters.walletId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
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
      include: [
        {
          model: Wallet,
          as: "wallet",
          attributes: ["id", "userId"], // Only fetch necessary fields
          include: [
            {
              model: User,
              as: "users",
              attributes: ["username"], // Only fetch the username
            },
          ],
        },
      ],
    };
    if (
      filters.page &&
      filters.limit &&
      filters.page > 0 &&
      filters.limit > 0
    ) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const transactions = await Transaction.findAll(queryOptions);
    return transactions;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getTransactionByIdRepo = async (
  transactionId: number,
  type?: TransactionType
): Promise<TransactionAttributes> => {
  try {
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: Deposit,
          as: "deposit", // Ensure the alias matches the association defined in the model
          required: false, // Left join to include transactions even if no deposit exists
          attributes: [
            "id",
            "orderId",
            "userId",
            "voucherId",
            "paymentMethodId",
            "amount",
            "status",
            "acceptedBy",
            "createdBy",
            "isDeleted",
            "createdAt",
            "updatedAt",
          ], // Explicitly select valid Deposit columns, excluding referenceId
          on: sequelizeSystem.where(
            sequelizeSystem.col("deposit.orderId"),
            Op.eq,
            sequelizeSystem.col("Transaction.referenceId")
          ),
        },
      ],
    });

    if (!transaction) {
      throw new ErrorType("NotFoundError", "Transaction not found");
    }

    return transaction;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
