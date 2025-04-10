import { DataTypes, Model } from "sequelize";
import { Campaign, sequelizeSystem } from "./index.model"; // Assuming this points to models/index.ts
import { KeywordAttributes } from "../interfaces/Keyword.interface";
import { DistributionType } from "../enums/distribution.enum";

class Keyword extends Model<KeywordAttributes> implements KeywordAttributes {
  public id!: number;
  public campaignId!: number;
  public name!: string;
  public url!: string[]; // Array of URLs
  public distribution!: DistributionType; // Enum type
  public traffic!: number;
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
      allowNull: false,
      references: {
        model: Campaign, // Use table name instead of direct model import
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for PostgreSQL
      allowNull: false,
    },
    distribution: {
      type: DataTypes.ENUM(...Object.values(DistributionType)), // Enum type
      allowNull: false,
    },
    traffic: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default value for consistency
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const rawValue = this.getDataValue("createdAt") as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace("Z", "+07:00");
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
        return adjustedDate.toISOString().replace("Z", "+07:00");
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