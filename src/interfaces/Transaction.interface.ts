import { TransactionStatus } from "../enums/transactionStatus.enum";
import { TransactionType } from "../enums/transactionType.enum";
import { WalletAttributes } from "./Wallet.interface";

export interface TransactionAttributes {
  id?: number;
  walletId: number;
  wallet? : WalletAttributes
  amount: number;
  status: TransactionStatus;
  type : TransactionType;
  referenceId?: string | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
