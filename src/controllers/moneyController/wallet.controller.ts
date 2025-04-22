import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getAllWalletsRepo,
  getWalletByIdRepo,
  updateWalletRepo,
  deleteWalletRepo,
} from "../../repositories/moneyRepo/wallet.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { WalletAttributes } from "../../interfaces/Wallet.interface";

// Get all wallets
export const getAllWallets = async (
  req: Request,
  res: Response<ResponseType<WalletAttributes[]>>
): Promise<void> => {
  try {
    const wallets = await getAllWalletsRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Wallets retrieved successfully",
      data: wallets.map((wallet: WalletAttributes) => ({
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching wallets",
      error: error.message,
    });
  }
};

// Get wallet by ID
export const getWalletById = async (
  req: Request,
  res: Response<ResponseType<WalletAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const wallet = await getWalletByIdRepo(Number(id));

    if (!wallet) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Wallet not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Wallet retrieved successfully",
      data: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching wallet",
      error: error.message,
    });
  }
};

// Update wallet
export const updateWallet = async (
  req: Request,
  res: Response<ResponseType<WalletAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    if (balance === undefined || isNaN(balance)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid balance is required",
        error: "Missing or invalid field",
      });
      return;
    }

    const wallet = await updateWalletRepo(Number(id), { balance });

    if (!wallet) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Wallet not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Wallet updated successfully",
      data: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error updating wallet",
      error: error.message,
    });
  }
};

// Delete wallet
export const deleteWallet = async (
  req: Request,
  res: Response<ResponseType<WalletAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await deleteWalletRepo(Number(id));

    if (!success) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Wallet not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Wallet deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error deleting wallet",
      error: error.message,
    });
  }
};


