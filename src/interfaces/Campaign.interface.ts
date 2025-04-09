import { Optional } from "sequelize";

export interface CampaignAttributes {
  id: number;
  adminId: number | null;
  seoerId: number | null;
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CampaignCreationAttributes
  extends Optional<CampaignAttributes, "id" | "createdAt" | "updatedAt"> {}
