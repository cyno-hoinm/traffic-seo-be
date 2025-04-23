import { DepositStatus } from "../enums/depositStatus.enum";
import { UserAttributes } from "./User.interface";

export interface DepositAttributes {
  id?: number;
  userId: number;
  users? : UserAttributes
  orderId: string;
  paymentMethodId?: number;
  voucherId: number;
  amount: number;
  status: DepositStatus;
  acceptedBy?: string;
  createdBy?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
