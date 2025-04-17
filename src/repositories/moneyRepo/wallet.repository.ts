import { WalletAttributes } from "../../interfaces/Wallet.interface";
import { Wallet } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

export const getAllWalletsRepo = async (): Promise<WalletAttributes[]> => {
  try {
    const wallets = await Wallet.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return wallets;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getWalletByIdRepo = async (id: number): Promise<WalletAttributes | null> => {
  try {
    const wallet = await Wallet.findByPk(id);
    return wallet;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateWalletRepo = async (
  id: number,
  data: { balance: number }
): Promise<Wallet | null> => {
  try {
    const wallet = await Wallet.findByPk(id);
    if (!wallet) return null;

    await wallet.update({ balance: data.balance });
    return wallet;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const deleteWalletRepo = async (id: number): Promise<boolean> => {
  try {
    const wallet = await Wallet.findByPk(id);
    if (!wallet) return false;

    await wallet.update({ isDeleted: true });
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getWalletByUserIdRepo = async (userId: number): Promise<WalletAttributes | null> => {
  try {
    const wallet = await Wallet.findOne({
      where: { userId }, 
    });

    if (!wallet) {
      return null;
    }
    return wallet.get({ plain: true }) as WalletAttributes;
  } catch (error: any) {
    // Handle Sequelize or other errors
    const errorMessage = error.message || 'Failed to fetch wallet';
    const errorCode = error.code || 'DATABASE_ERROR';
    throw new ErrorType(error.name || 'SequelizeError', errorMessage, errorCode);
  }
};