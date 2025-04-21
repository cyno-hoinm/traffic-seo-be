import { TransactionStatus } from "../enums/transactionStatus.enum";
import { TransactionType } from "../enums/transactionType.enum";

export interface TransactionAttributes {
  id?: number;
  walletId: number;
  amount: number;
  status: TransactionStatus;
  type : TransactionType;
  referenceId?: string | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
