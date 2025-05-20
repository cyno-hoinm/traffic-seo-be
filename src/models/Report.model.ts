import { DataTypes, Model } from "sequelize";
import { sequelizeSystem, Image, User } from "./index.model";
import { ReportAttributes } from "../interfaces/Report.interface";
import { logger } from "../config/logger.config";
import { ReportStatus } from "../enums/reportStatus.enum";
class Report extends Model<ReportAttributes> implements ReportAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public content!: string;
  public imgIds!: number[];
  public isDeleted!: boolean;
  public status!: ReportStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Report.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imgIds: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue("imgIds");
        try {
          const parsedValue = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
          return parsedValue;
        } catch (error) {
          logger.error(error);
          return [];
        }
      },
      set(value: string[]) {
        this.setDataValue("imgIds" as any, JSON.stringify(value));
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ReportStatus.PENDING,
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
    modelName: "Report",
    tableName: "reports",
    timestamps: true,
  }
);

// Set up the relationship with Image model
Report.belongsToMany(Image, {
  through: "ReportImages",
  foreignKey: "reportId",
  otherKey: "imageId",
  as: "images",
});

Image.belongsToMany(Report, {
  through: "ReportImages",
  foreignKey: "imageId",
  otherKey: "reportId",
  as: "reports",
});

export default Report;
