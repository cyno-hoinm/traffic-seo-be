import { Optional } from "sequelize";

export interface SEOerAttributes {
  id: number;
  email: string;
  password: string;
  walletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SEOerCreationAttributes
  extends Optional<SEOerAttributes, "id" | "createdAt" | "updatedAt"> {}
