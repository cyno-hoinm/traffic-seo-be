import { DataTypes, Model } from "sequelize";
import { Country, sequelizeSystem, User } from "./index.model";
import { CampaignStatus } from "../enums/campaign.enum";
import { CampaignAttributes } from "../interfaces/Campaign.interface";
import { CampaignTypeAttributes } from "../interfaces/CampaignType.interface";
import CampaignType from "./CampaignType.model";
import { KeywordAttributes } from "../interfaces/Keyword.interface";
import { LinkAttributes } from "../interfaces/Link.interface";

class Campaign extends Model<CampaignAttributes> implements CampaignAttributes {
  public id!: number;
  public userId!: number;
  public countryId!: number;
  public name!: string;
  public campaignTypeId!: CampaignTypeAttributes;
  public device!: string;
  public title!: string;
  public startDate!: Date;
  public endDate!: Date;
  public totalTraffic!: number;
  public domain!: string;
  public search!: string;
  public linksCount!: number;
  public keywordsCount!: number;
  public keywords!: KeywordAttributes[];
  public links!: LinkAttributes[];
  public isDeleted!: boolean;
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
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Country,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campaignTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CampaignType,
        key: "id",
      },
    },
    device: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    title: {
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
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    search: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
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
    modelName: "Campaign",
    tableName: "campaigns",
    timestamps: true,
  }
);

export default Campaign;
