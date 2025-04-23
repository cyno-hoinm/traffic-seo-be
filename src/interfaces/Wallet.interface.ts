import { UserAttributes } from "./User.interface";

export interface WalletAttributes {
  id?: number;
  userId: number;
  users?: UserAttributes;
  balance: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
