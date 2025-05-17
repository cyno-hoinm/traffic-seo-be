import { Deposit, PaymentMethod, User, Wallet } from "../../models/index.model";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { sequelizeSystem } from "../../models/index.model";
import { Op, Transaction } from "sequelize";
import { createTransactionRepo } from "./transaction.repository";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { ErrorType } from "../../types/Error.type";
import { TransactionType } from "../../enums/transactionType.enum";
import { DepositAttributes } from "../../interfaces/Deposit.interface";
import { getConfigByNameRepo } from "../commonRepo/config.repository";
import { ConfigApp } from "../../constants/config.constants";
import { getVoucherByIdRepo } from "./voucher.repository";
import { getPackageByIdRepo } from "./packge.deposit";
export const getDepositListRepo = async (filters: {
  userId?: number;
  start_date?: Date;
  end_date?: Date;
  status?: DepositStatus;
  page?: number;
  limit?: number;
}): Promise<{ deposits: DepositAttributes[]; total: number }> => {
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
      include: [
        {
          model: User,
          as: "users",
          attributes: ["username"], // Only fetch the username
        },
        {
          model: PaymentMethod,
          as: "paymentMethods",
          attributes: ["id", "name", "unit"], // Only fetch the username
        },
      ],
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
}): Promise<DepositAttributes> => {
  return await sequelizeSystem.transaction(async (t: Transaction) => {
    try {
      // Validate existing deposit
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

      // Get voucher and wallet
      const voucher = await getVoucherByIdRepo(data.voucherId);
      const voucherValue = voucher?.value || 1;

      const wallet = await Wallet.findOne({
        where: { userId: data.userId },
        transaction: t,
      });
      if (!wallet) {
        throw new ErrorType("NotFoundError", "Wallet not found for this user");
      }

      // Create deposit
      const newDeposit = await Deposit.create(
        {
          userId: data.userId,
          voucherId: data.voucherId,
          amount: data.amount,
          status: data.status,
          createdBy: data.createdBy,
          paymentMethodId: data.paymentMethodId,
          orderId: data.orderId,
          acceptedBy: "system",
          packageId: undefined,
        },
        { transaction: t }
      );

      // Handle completed deposit
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

        // Get exchange rate
        const exchangeValue = await getExchangeRate(data.paymentMethodId);
        const transactionAmount = amount / exchangeValue;
        const finalAmount =
          transactionAmount + transactionAmount * (voucherValue / 100);

        // Create transaction and notification
        await createTransactionRepo(
          {
            walletId: wallet.id,
            amount: finalAmount,
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

const getExchangeRate = async (paymentMethodId: number): Promise<number> => {
  if (paymentMethodId === 1) {
    const config = await getConfigByNameRepo(ConfigApp.USD_TO_CREDIT);
    if (!config) {
      throw new ErrorType(
        "ConfigError",
        "Configuration for USD_TO_CREDIT not found"
      );
    }
    return parseFloat(config.value);
  }

  if (paymentMethodId === 3) {
    const config = await getConfigByNameRepo(ConfigApp.VND_TO_CREDIT);
    if (!config) {
      throw new ErrorType(
        "ConfigError",
        "Configuration for VND_TO_CREDIT not found"
      );
    }
    return parseFloat(config.value);
  }

  return 1;
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
      include: [
        {
          model: PaymentMethod,
          as: "paymentMethods", // Adjust to match your model association alias (singular if one-to-one)
          required: true, // Inner join to only return deposits with matching payment methods
        },
      ],
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

export const checkUserUsedPaymentMethodGiftRepo = async (
  userId: number
): Promise<boolean> => {
  try {
    const deposit = await Deposit.findOne({
      where: {
        userId,
        paymentMethodId: 4,
        isDeleted: false, // nếu có trường này để loại bỏ bản ghi đã xóa mềm
      },
    });

    if (deposit) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

export const createDepositByPackageRepo = async (data: {
  createdBy: number;
  userId: number;
  packageId: number;
  orderId: string;
  status: DepositStatus;
}): Promise<DepositAttributes> => {
  return await sequelizeSystem.transaction(async (t: Transaction) => {
    try {
      // Validate existing deposit
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

      const wallet = await Wallet.findOne({
        where: { userId: data.userId },
        transaction: t,
      });
      if (!wallet) {
        throw new ErrorType("NotFoundError", "Wallet not found for this user");
      }
      const pkg = await getPackageByIdRepo(data.packageId);
      if (!pkg) {
        throw new ErrorType("NotFoundError", "Package not found");
      }
      // Create deposit
      const newDeposit = await Deposit.create(
        {
          userId: data.userId,
          voucherId: null,
          amount: pkg?.price || 0,
          status: data.status,
          createdBy: data.createdBy,
          paymentMethodId: 4,
          orderId: data.orderId,
          acceptedBy: "system",
          packageId: data.packageId,
        },
        { transaction: t }
      );

      const transactionAmount = pkg?.bonus || 0;

      // Create transaction and notification
      await createTransactionRepo(
        {
          walletId: wallet.id,
          amount: transactionAmount,
          status: TransactionStatus.COMPLETED,
          type: TransactionType.DEPOSIT,
          referenceId: String(newDeposit.id),
        },
        t
      );

      return newDeposit;
    } catch (error: any) {
      throw new ErrorType(error.name, error.message, error.code);
    }
  });
};
