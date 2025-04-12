import { DepositStatus } from "../enums/depositStatus.enum";

export interface DepositAttributes {
  id?: number;
  userId: number;
  paymentMethodId: number;
  voucherId: number;
  amount: number;
  status: DepositStatus;
  acceptedBy?: string;
  createdBy?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
