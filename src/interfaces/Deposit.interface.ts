import { DepositStatus } from "../enums/depositStatus.enum";
import { PackageAttributes } from "./Package.interface";
import { PaymentMethodAttributes } from "./PaymentMethod.interface";
import { TransactionAttributes } from "./Transaction.interface";
import { UserAttributes } from "./User.interface";

export interface DepositAttributes {
  id?: number;
  userId: number;
  users?: UserAttributes;
  orderId: string;
  paymentMethodId?: number;
  paymentMethods?: PaymentMethodAttributes;
  transactions?: TransactionAttributes;
  voucherId: number | null;
  amount: number;
  status: DepositStatus;
  packageId?: number;
  packages?: PackageAttributes;
  acceptedBy?: string;
  createdBy?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
