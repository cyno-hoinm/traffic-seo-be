import { TransactionStatus } from "../../enums/transactionStatus.enum";
import {
  Deposit,
  sequelizeSystem,
  Transaction,
  User,
  Wallet,
} from "../../models/index.model";
import { Op, QueryTypes, Sequelize } from "sequelize";
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
  transactionId: number
): Promise<any> => {
  try {
    const [transaction]: any[] = await sequelizeSystem.query(
      `
      SELECT 
        t.id,
        t.walletId,
        t.amount,
        t.status,
        t.type,
        t.referenceId,
        t.isDeleted,
        t.createdAt,
        t.updatedAt,
        w.id AS wallet_id,
        c.name AS campaign_name,
        d.id AS deposit_id,
        d.orderId AS deposit_orderId,
        d.userId AS deposit_userId,
        d.voucherId AS deposit_voucherId,
        d.paymentMethodId AS deposit_paymentMethodId,
        d.amount AS deposit_amount,
        d.status AS deposit_status,
        d.acceptedBy AS deposit_acceptedBy,
        d.createdBy AS deposit_createdBy,
        d.isDeleted AS deposit_isDeleted,
        d.createdAt AS deposit_createdAt,
        d.updatedAt AS deposit_updatedAt
      FROM transactions t
      LEFT JOIN deposits d ON d.id = t.referenceId AND d.isDeleted = false
      LEFT JOIN wallets w ON w.id = t.walletId

      WHERE t.id = :transactionId;
      `,
      {
        replacements: { transactionId },
        type: QueryTypes.SELECT,
      }
    );

    if (!transaction) {
      throw new ErrorType("NotFoundError", "Transaction not found");
    }

    return {
      id: transaction.id,
      walletId: transaction.walletId,
      wallet: transaction.wallet_id
        ? {
            id: transaction.wallet_id,
            name: transaction.wallet_name,
            // Map other wallet fields
          }
        : undefined,
      amount: transaction.amount,
      campaign: transaction.campaign_id
        ? {
            id: transaction.campaign_id,
            name: transaction.campaign_name,
            // Map other campaign fields
          }
        : undefined,
      status: transaction.status,
      type: transaction.type,
      referenceId: transaction.referenceId,
      isDeleted: transaction.isDeleted,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      deposit: transaction.deposit_id
        ? {
            id: transaction.deposit_id,
            orderId: transaction.deposit_orderId,
            userId: transaction.deposit_userId,
            voucherId: transaction.deposit_voucherId,
            paymentMethodId: transaction.deposit_paymentMethodId,
            amount: transaction.deposit_amount,
            status: transaction.deposit_status,
            acceptedBy: transaction.deposit_acceptedBy,
            createdBy: transaction.deposit_createdBy,
            isDeleted: transaction.deposit_isDeleted,
            createdAt: transaction.deposit_createdAt,
            updatedAt: transaction.deposit_updatedAt,
          }
        : undefined,
    };
  } catch (error: any) {
    console.log(error);
    throw new ErrorType(error.name, error.message, error.code);
  }
};