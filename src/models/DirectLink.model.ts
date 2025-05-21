import { DataTypes, Model } from "sequelize";
import { Campaign, sequelizeSystem } from "./index.model"; // Assuming this points to models/index.ts
import { DistributionType } from "../enums/distribution.enum";
import { DirectLinkAttributes } from "../interfaces/DirectLink.interface";

class DirectLink extends Model<DirectLinkAttributes> implements DirectLinkAttributes {
  public id!: number;
  public campaignId!: number | null; // Nullable if not always present
  public link!: string;
  public status!: string;
  public distribution!: DistributionType; // Enum type
  public traffic!: number;
  public timeOnSite!: number;
  public cost!: number;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DirectLink.init(
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
    link: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "DirectLink",
    tableName: "directLinks",
    timestamps: true,
  }
);

export default DirectLink;
