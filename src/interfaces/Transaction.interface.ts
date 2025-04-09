import { TransactionStatus } from "../enums/transactionStatus.enum";

export interface TransactionAttributes {
  id?: number;
  walletId: number;
  amount: number;
  status: TransactionStatus;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
