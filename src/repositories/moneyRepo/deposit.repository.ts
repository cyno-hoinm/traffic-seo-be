import { Deposit, Wallet } from "../../models/index.model"; // Adjust path
import { DepositStatus } from "../../enums/depositStatus.enum";
import { sequelizeSystem } from "../../models/index.model";
import { Op } from "sequelize";
import { createTransactionRepo } from "././transaction.repository";
import { TransactionStatus } from "../../enums/transactionStatus.enum";

// Custom error class
class ErrorType extends Error {
  constructor(name: string, message: string, code?: string) {
    super(message);
    this.name = name;
    if (code) this.code = code;
  }
  code?: string;
}

// Get deposit list with filters and pagination
export const getDepositListRepo = async (filters: {
  userId?: number;
  start_date?: Date;
  end_date?: Date;
  status?: DepositStatus;
  pageSize: number;
  pageLimit: number;
}): Promise<{ deposits: Deposit[]; total: number }> => {
  try {
    const where: any = {};

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

    const offset = (filters.pageLimit - 1) * filters.pageSize;
    const { rows: deposits, count: total } = await Deposit.findAndCountAll({
      where,
      limit: filters.pageSize,
      offset,
    });

    return { deposits, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Create a new deposit
export const createDepositRepo = async (data: {
  createdBy: string; // From token
  userId: number;
  voucherId: number;
  amount: number;
  method: string;
}): Promise<Deposit> => {
  try {
    // Check if wallet exists for the user
    const wallet = await Wallet.findOne({ where: { userId: data.userId } });
    if (!wallet) {
      throw new ErrorType("NotFoundError", "Wallet not found for this user");
    }

    const depositData = {
      userId: data.userId,
      voucherId: data.voucherId,
      amount: data.amount,
      method: data.method,
      status: DepositStatus.PENDING, // Default status
      acceptedBy: data.createdBy, // Initially set as createdBy
    };

    const deposit = await Deposit.create(depositData);
    return deposit;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Update deposit and create transaction if completed
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
        // Update deposit
        await deposit.update(
          { acceptedBy: data.acceptedBy, status: data.status },
          { transaction: t }
        );
  
        // If status is COMPLETED, create a CHARGE transaction
        if (data.status === DepositStatus.COMPLETED) {
          await createTransactionRepo(
            {
              walletId: wallet.id,
              amount: deposit.amount,
              status: TransactionStatus.CHARGE, // Use enum value
            },
            t // Pass the transaction object
          );
        }
  
        return deposit;
      });
  
      return updatedDeposit;
    } catch (error: any) {
      throw new ErrorType(error.name, error.message, error.code);
    }
  };