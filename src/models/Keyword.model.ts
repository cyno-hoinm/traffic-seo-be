import { DataTypes, Model } from "sequelize";
import { Campaign, sequelizeSystem } from "./index.model"; // Assuming this points to models/index.ts
import { KeywordAttributes } from "../interfaces/Keyword.interface";
import { DistributionType } from "../enums/distribution.enum";

class Keyword extends Model<KeywordAttributes> implements KeywordAttributes {
  public id!: number;
  public campaignId!: number | null; // Nullable if not always present
  public name!: string;
  public urls!: string[]; // Array of URLs
  public distribution!: DistributionType; // Enum type
  public traffic!: number;
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
