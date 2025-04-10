import { Wallet } from "../models/index.model";
import { ErrorType } from "../types/Error.type";

// Get all wallets
export const getAllWalletsRepo = async (): Promise<Wallet[]> => {
  try {
    const wallets = await Wallet.findAll();
    return wallets;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get wallet by ID
export const getWalletByIdRepo = async (id: number): Promise<Wallet | null> => {
  try {
    const wallet = await Wallet.findByPk(id);
    return wallet;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Update wallet
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

// Delete wallet
export const deleteWalletRepo = async (id: number): Promise<boolean> => {
  try {
    const wallet = await Wallet.findByPk(id);
    if (!wallet) return false;

    await wallet.destroy();
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
