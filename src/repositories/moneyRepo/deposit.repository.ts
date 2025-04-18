import { Deposit, Wallet } from "../../models/index.model";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { sequelizeSystem } from "../../models/index.model";
import { Op, Transaction } from "sequelize";
import { createTransactionRepo } from "././transaction.repository";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { ErrorType } from "../../types/Error.type";
import payOSPaymentMethod from "../../config/payOs.config";
import { uuidToNumber } from "../../utils/generate";

export const getDepositListRepo = async (filters: {
  userId?: number;
  start_date?: Date;
  end_date?: Date;
  status?: DepositStatus;
  page?: number;
  limit?: number;
}): Promise<{ deposits: Deposit[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.userId) {
      where.userId = filters.userId;
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

    // Apply pagination only if page and limit are not 0
    if (
      filters.page &&
      filters.limit &&
      filters.page > 0 &&
      filters.limit > 0
    ) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: deposits, count: total } = await Deposit.findAndCountAll(
      queryOptions
    );

    return { deposits, total };
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
}): Promise<any> => {
  // Start a transaction
  return await sequelizeSystem.transaction(async (t: Transaction) => {
    try {
      // Check if a deposit with the given orderId already exists
      const existingDeposit = await Deposit.findOne({
        where: { orderId: data.orderId },
        transaction: t,
      });
      if (existingDeposit) {
        throw new ErrorType(
          "DuplicateOrderIdError",
          `Deposit with orderId ${data.orderId} already exists`
        );
      }

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
        // Sanitize and validate deposit.amount
        const amount = parseFloat(
          data.amount.toString().replace(/[^0-9.]/g, "")
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
            status: TransactionStatus.CHARGE,
          },
          t // Pass transaction to createTransactionRepo
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
): Promise<Deposit | null> => {
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
            status: TransactionStatus.CHARGE,
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
): Promise<Deposit | null> => {
  try {
    const deposit = await Deposit.findByPk(id);

    if (!deposit) {
      return null; // Or throw new ErrorType("NotFoundError", "Deposit not found") if you prefer
    }

    return deposit;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getDepositByOrderIdRepo = async (
  orderId: string,
  userId: number
): Promise<Deposit | null> => {
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
