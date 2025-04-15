import { DepositStatus } from "../enums/depositStatus.enum";

export interface DepositAttributes {
  id?: number;
  userId: number;
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
