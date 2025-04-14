import { Deposit, Wallet } from "../../models/index.model";
import { DepositStatus } from "../../enums/depositStatus.enum";
import { sequelizeSystem } from "../../models/index.model";
import { Op } from "sequelize";
import { createTransactionRepo } from "././transaction.repository";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { ErrorType } from "../../types/Error.type";

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
    if (filters.page && filters.limit && filters.page > 0 && filters.limit > 0) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: deposits, count: total } = await Deposit.findAndCountAll(queryOptions);

    return { deposits, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createDepositRepo = async (data: {
  createdBy: string;
  userId: number;
  paymentMethodId: number;
  voucherId: number;
  amount: number;
}): Promise<Deposit> => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: data.userId } });
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found for this user");
    }

    const depositData = {
      userId: data.userId,
      voucherId: data.voucherId,
      amount: data.amount,
      paymentMethodId: data.paymentMethodId,
      status: DepositStatus.PENDING,
      acceptedBy: data.createdBy,
    };

    const deposit = await Deposit.create(depositData);
    return deposit;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateDepositRepo = async (
  id: number,
  data: {
    acceptedBy: string;
    status: DepositStatus.COMPLETED | DepositStatus.FAILED;
  }
): Promise<Deposit | null> => {
  try {
    const deposit = await Deposit.findByPk(id);
    if (!deposit) {
      return null;
    }

    const wallet = await Wallet.findOne({ where: { userId: deposit.userId } });
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found for this user");
    }

    const updatedDeposit = await sequelizeSystem.transaction(async (t) => {
      await deposit.update(
        { acceptedBy: data.acceptedBy, status: data.status },
        { transaction: t }
      );

      if (data.status === DepositStatus.COMPLETED) {
        await createTransactionRepo(
          {
            walletId: wallet.id,
            amount: deposit.amount,
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
