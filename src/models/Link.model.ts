import { DataTypes, Model } from "sequelize";
import { Campaign, sequelizeSystem } from "./index.model";
import { LinkStatus } from "../enums/linkStatus.enum";
import { LinkAttributes } from "../interfaces/Link.interface";
import { DistributionType } from "../enums/distribution.enum";

class Link extends Model<LinkAttributes> implements LinkAttributes {
  public id!: number;
  public campaignId!: number;
  public link!: string;
  public linkTo!: string;
  public distribution!: DistributionType;
  public traffic!: number;
  public anchorText!: string;
  public status!: LinkStatus;
  public url!: string;
  public page!: string;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Link.init(
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
        model: Campaign,
        key: "id",
      },
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    linkTo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distribution: {
      type: DataTypes.ENUM(...Object.values(DistributionType)),
      allowNull: false,
    },
    traffic: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    anchorText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LinkStatus)),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    page: {
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
    modelName: "Link",
    tableName: "links",
    timestamps: true,
  }
);

export default Link;
