import { Optional } from "sequelize";

export interface AdminAttributes {
  id: number;
  email: string;
  password: string;
  walletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface AdminCreationAttributes
  extends Optional<AdminAttributes, "id" | "createdAt" | "updatedAt"> {}
