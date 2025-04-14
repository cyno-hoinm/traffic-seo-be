export interface WalletAttributes {
    id?: number;
    userId: number;
    balance: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }