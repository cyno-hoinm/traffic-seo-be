import { DataTypes, Model } from "sequelize";
import {
  CampaignAttributes,
  CampaignCreationAttributes,
} from "../interfaces/Campain.interface";
import Admin from "./Admin.model";
import SEOer from "./SEOer.model";
import sequelizeSystem from "../database/connect";

class Campaign
  extends Model<CampaignAttributes, CampaignCreationAttributes>
  implements CampaignAttributes
{
  public id!: number;
  public adminId!: number | null;
  public seoerId!: number | null;
  public type!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Admin,
        key: "id",
      },
    },
    seoerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SEOer,
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("traffic", "backlink"),
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
    status: {
      type: DataTypes.ENUM("active", "paused", "completed"),
      defaultValue: "active",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: sequelizeSystem,
    tableName: "campaigns",
    timestamps: true,
  }
);

export default Campaign;
