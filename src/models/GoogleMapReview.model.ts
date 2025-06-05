import { DataTypes, Model } from "sequelize";
import { GoogleMapReviewAttributes } from "../interfaces/GoogleMapReview.interface";
import { sequelizeSystem } from "./index.model";
import { logger } from "../config/logger.config";


class GoogleMapReview extends Model<GoogleMapReviewAttributes> implements GoogleMapReviewAttributes {
    public id!: number;
    public campaignId!: number;
    public content!: string;
    public location!: string;
    public googleMapUrl!: string;
    public status!: string;
    public cost!: number;
    public stars!: number;
    public imgUrls!: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GoogleMapReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    googleMapUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
    },
    imgUrls: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue("imgUrls");
        try {
          const parsedValue = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
          return parsedValue;
        } catch (error) {
          logger.error(error);
          return [];
        }
      },
      set(value: string[]) {
        this.setDataValue("imgUrls" as any, JSON.stringify(value));
      },
    },
    stars: {
      type: DataTypes.INTEGER,

    },
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    modelName: "GoogleMapReview",
    tableName: "googleMapReviews",
    timestamps: true,
  }
)


export default GoogleMapReview
