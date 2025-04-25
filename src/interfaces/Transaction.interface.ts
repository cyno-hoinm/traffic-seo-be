import { TransactionStatus } from "../enums/transactionStatus.enum";
import { TransactionType } from "../enums/transactionType.enum";
import { CampaignAttributes } from "./Campaign.interface";
import { WalletAttributes } from "./Wallet.interface";

export interface TransactionAttributes {
  id?: number;
  walletId: number;
  wallet? : WalletAttributes
  amount: number;
  campaign? : CampaignAttributes
  status: TransactionStatus;
  type : TransactionType;
  referenceId?: string | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
