import {
  Deposit,
  PaymentMethod,
  TransactionModel,
  User,
  Wallet,
} from "../../models/index.model";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { sequelizeSystem } from "../../models/index.model";
import { Op, QueryTypes, Sequelize, Transaction } from "sequelize";
import { createTransactionRepo } from "././transaction.repository";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { ErrorType } from "../../types/Error.type";
import { TransactionType } from "../../enums/transactionType.enum";
import { DepositAttributes } from "../../interfaces/Deposit.interface";
import { getConfigByNameRepo } from "../commonRepo/config.repository";
import { ConfigApp } from "../../constants/config.constants";
import { getVoucherByIdRepo } from "./voucher.repository";

export const getDepositListRepo = async (filters: {
  userId?: number;
  start_date?: Date;
  end_date?: Date;
  status?: DepositStatus;
  page?: number;
  limit?: number;
}): Promise<{ deposits: DepositAttributes[]; total: number }> => {
  try {
    const whereConditions: string[] = ['d.isDeleted = false'];
    const queryParams: any = {};

    if (filters.userId) {
      whereConditions.push('d.userId = :userId');
      queryParams.userId = filters.userId;
    }
    if (filters.status) {
      whereConditions.push('d.status = :status');
      queryParams.status = filters.status;
    }
    if (filters.start_date) {
      whereConditions.push('d.createdAt >= :start_date');
      queryParams.start_date = filters.start_date;
    }
    if (filters.end_date) {
      whereConditions.push('d.createdAt <= :end_date');
      queryParams.end_date = filters.end_date;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    let limitOffsetClause = '';
    if (filters.page && filters.limit && filters.page > 0 && filters.limit > 0) {
      queryParams.offset = (filters.page - 1) * filters.limit;
      queryParams.limit = filters.limit;
      limitOffsetClause = 'LIMIT :limit OFFSET :offset';
    }

    const mainQuery = `
      SELECT 
        d.*,
        u.username AS users_username,
        pm.id AS paymentMethods_id,
        pm.name AS paymentMethods_name,
        pm.unit AS paymentMethods_unit,
        t.id AS transactions_id,
        t.referenceId AS transactions_referenceId,
        t.amount AS transactions_amount
      FROM deposits d
      LEFT JOIN users u ON d.userId = u.id
      LEFT JOIN paymentMethods pm ON d.paymentMethodId = pm.id
      LEFT JOIN transactions t ON d.id = t.referenceId
      ${whereClause}
      ORDER BY d.createdAt DESC
      ${limitOffsetClause}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM deposits d
      ${whereClause}
    `;

    const [deposits] = await Promise.all([
      sequelizeSystem.query(mainQuery, {
        replacements: queryParams,
        type: QueryTypes.SELECT,
        nest: true,
        raw: true,
      }),
      sequelizeSystem.query(countQuery, {
        replacements: queryParams,
        type: QueryTypes.SELECT,
      }),
    ]);

    const formattedDeposits = deposits.map((deposit: any) => ({
      ...deposit,
      users: deposit.users_username ? { username: deposit.users_username } : null,
      paymentMethods: deposit.paymentMethods_id
        ? {
            id: deposit.paymentMethods_id,
            name: deposit.paymentMethods_name,
            unit: deposit.paymentMethods_unit,
          }
        : null,
      transactions: deposit.transactions_id
        ? [
            {
              id: deposit.transactions_id,
              amount: deposit.transactions_amount,
            },
          ]
        : [],
    }));

    const total = deposits.length;

    return { deposits: formattedDeposits, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createDepositRepo = async (data: {
  createdBy: number;
  userId: number;
  voucherId: number;
  amount: number;
  paymentMethodId: number;
  orderId: string;
  status: DepositStatus;
}): Promise<DepositAttributes> => {
  // Start a transaction
  return await sequelizeSystem.transaction(async (t: Transaction) => {
    try {
      // Check if a deposit with the given orderId already exists
      const existingDeposit = await Deposit.findOne({
        where: { orderId: data.orderId },
        transaction: t,
        attributes: [
          "id",
          "orderId",
          "userId",
          "voucherId",
          "amount",
          "status",
          "createdBy",
          "paymentMethodId",
        ],
      });
      if (existingDeposit) {
        throw new ErrorType(
          "DuplicateOrderIdError",
          `Deposit with orderId ${data.orderId} already exists`
        );
      }
      const voucher = await getVoucherByIdRepo(data.voucherId);
      const voucherValue = voucher?.value ? voucher.value : 1;
      // Find wallet for the user
      const wallet = await Wallet.findOne({
        where: { userId: data.userId },
        transaction: t,
      });
      if (!wallet) {
        throw new ErrorType("NotFoundError", "Wallet not found for this user");
      }

      // Prepare deposit data
      const depositData = {
        userId: data.userId,
        voucherId: data.voucherId,
        amount: data.amount,
        status: data.status,
        createdBy: data.createdBy,
        paymentMethodId: data.paymentMethodId,
        orderId: data.orderId,
        acceptedBy: "system",
      };

      // Create new deposit
      const newDeposit = await Deposit.create(depositData, { transaction: t });

      // Handle transaction for COMPLETED status
      if (data.status === DepositStatus.COMPLETED) {
        const amount = parseFloat(
          data.amount.toString().replace(/[^0-9.]/g, "")
        );
        if (isNaN(amount) || amount <= 0) {
          throw new ErrorType(
            "InvalidAmountError",
            "Invalid deposit amount format"
          );
        }

        let exchangeValue = 1;
        if (depositData.paymentMethodId === 1) {
          const config = await getConfigByNameRepo(ConfigApp.USD_TO_CREDIT);
          if (config) {
            exchangeValue = parseFloat(config.value);
          } else {
            throw new ErrorType(
              "ConfigError",
              "Configuration for USD_TO_CREDIT not found"
            );
          }
        } else if (depositData.paymentMethodId === 3) {
          const config = await getConfigByNameRepo(ConfigApp.VND_TO_CREDIT);
          if (config) {
            exchangeValue = parseFloat(config.value);
          } else {
            throw new ErrorType(
              "ConfigError",
              "Configuration for VND_TO_CREDIT not found"
            );
          }
        }
        const transactionAmount = amount / exchangeValue;
        await createTransactionRepo(
          {
            walletId: wallet.id,
            amount:
              transactionAmount + transactionAmount * (voucherValue / 100),
            status: TransactionStatus.COMPLETED,
            type: TransactionType.DEPOSIT,
            referenceId: String(newDeposit.id),
          },
          t
        );
      }

      return newDeposit;
    } catch (error: any) {
      throw new ErrorType(error.name, error.message, error.code);
    }
  });
};
export const updateDepositRepo = async (
  id: number,
  status: DepositStatus
): Promise<DepositAttributes | null> => {
  try {
    const deposit = await Deposit.findByPk(id);
    if (!deposit) {
      return null;
    }
    if (deposit.status !== DepositStatus.PENDING) {
      throw new ErrorType(
        "InvalidStatusError",
        "Deposit status is not PENDING"
      );
    }
    const acceptedBy = "system";
    const wallet = await Wallet.findOne({ where: { userId: deposit.userId } });
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found for this user");
    }

    const updatedDeposit = await sequelizeSystem.transaction(async (t) => {
      await deposit.update(
        {
          acceptedBy: acceptedBy,
          status: status,
        },
        { transaction: t }
      );

      if (status === DepositStatus.COMPLETED) {
        // Sanitize and validate deposit.amount
        const amount = parseFloat(
          deposit.amount.toString().replace(/[^0-9.]/g, "")
        );
        if (isNaN(amount) || amount <= 0) {
          throw new ErrorType(
            "InvalidAmountError",
            "Invalid deposit amount format"
          );
        }

        await createTransactionRepo(
          {
            walletId: wallet.id,
            amount: amount,
            status: TransactionStatus.COMPLETED,
            type: TransactionType.DEPOSIT,
            referenceId: updatedDeposit.orderId.toString(), // Use the deposit ID as reference
          },
          t
        );
      }

      return deposit;
    });

    return updatedDeposit;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getDepositByIdRepo = async (
  id: number
): Promise<DepositAttributes | null> => {
  try {
    const deposit = await Deposit.findOne({
      where: { id }, // Filter by the provided ID
      include: [
        {
          model: PaymentMethod,
          as: "paymentMethods", // Adjust to match your model association alias (singular if one-to-one)
          required: true, // Inner join to only return deposits with matching payment methods
        },
      ],
    });

    if (!deposit) {
      return null; // Deposit not found
    }

    return deposit;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getDepositByOrderIdRepo = async (
  orderId: string,
  userId: number
): Promise<DepositAttributes | null> => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new ErrorType("ValidationError", "Invalid order ID or user ID");
    }

    const deposit = await Deposit.findOne({
      where: {
        orderId, // Assuming `orderId` is a field in the Deposit model
        userId, // Ensure the deposit belongs to the user
      },
    });

    return deposit || null;
  } catch (error: any) {
    throw new ErrorType(
      error.name || "DatabaseError",
      error.message || "Failed to fetch deposit",
      error.code
    );
  }
};
