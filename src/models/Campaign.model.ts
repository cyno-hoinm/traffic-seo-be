import { DataTypes, Model } from "sequelize";
import { sequelizeSystem } from "./index.model";
import { CampaignStatus } from "../enums/campaign.enum";
import User from "./User.model";
import { CampaignAttributes } from "../interfaces/Campaign.interface";
import Country from "./Country.model";

class Campaign extends Model<CampaignAttributes> implements CampaignAttributes {
  public id!: number;
  public userId!: number;
  public countryId!: number;
  public name!: string;
  public type!: string;
  public device!: string;
  public timeCode!: string;
  public startDate!: Date;
  public endDate!: Date;
  public totalTraffic!: number;
  public cost!: number;
  public domain!: string;
  public search!: string;
  public keyword!: string;
  public status!: CampaignStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Country,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timeCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalTraffic: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    search: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CampaignStatus)),
      allowNull: false,
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
    modelName: "Campaign",
    tableName: "campaigns",
    timestamps: true,
  }
);

export default Campaign;
