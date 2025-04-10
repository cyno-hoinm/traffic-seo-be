import { TransactionStatus } from "../enums/transactionStatus.enum";

export interface TransactionAttributes {
  id?: number;
  walletId: number;
  amount: number;
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
