import { Optional } from "sequelize";

export interface TransactionAttributes {
  id: number;
  adminId: number | null;
  seoerId: number | null;
  amount: number;
  txId: string;
  type: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionCreationAttributes
  extends Optional<TransactionAttributes, "id" | "createdAt" | "updatedAt"> {}
