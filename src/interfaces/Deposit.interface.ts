import { DepositStatus } from "../enums/depositStatus.enum";

export interface DepositAttributes {
  id?: number;
  userId: number;
  voucherId: number;
  amount: number;
  method: string;
  status: DepositStatus;
  acceptedBy?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
