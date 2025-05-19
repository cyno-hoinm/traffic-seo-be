import { DataTypes, Model } from "sequelize";
import { Campaign, sequelizeSystem } from "./index.model"; // Assuming this points to models/index.ts
import { KeywordAttributes } from "../interfaces/Keyword.interface";
import { DistributionType } from "../enums/distribution.enum";
import { logger } from "../config/logger.config";

class Keyword extends Model<KeywordAttributes> implements KeywordAttributes {
  public id!: number;
  public campaignId!: number | null; // Nullable if not always present
  public name!: string;
  public status!: string;
  public urls!: string; // Array stored as JSON
  public distribution!: DistributionType; // Enum type
  public traffic!: number;
  public timeOnSite!: number;
  public cost!: number;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Keyword.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Campaign, // Use table name instead of direct model import
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    urls: {
      type: DataTypes.TEXT, // Store as JSON in MySQL
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("urls");
        try {
          const parsedValue = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
          return parsedValue;
        } catch (error) {
          logger.error(error);
          return [];
        }
      },
      set(value: string[]) {
        this.setDataValue("urls", JSON.stringify(value));
      },
    },
    distribution: {
      type: DataTypes.STRING, // Enum type
      allowNull: true,
    },
    timeOnSite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    traffic: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const rawValue = this.getDataValue("createdAt") as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace("Z", "");
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const rawValue = this.getDataValue("updatedAt") as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace("Z", "");
      },
    },
  },
  {
    sequelize: sequelizeSystem,
    modelName: "Keyword",
    tableName: "keywords",
    timestamps: true,
  }
);

export default Keyword;
