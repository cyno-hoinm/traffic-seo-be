import { DataTypes, Model } from "sequelize";
import { NotificationAttributes } from "../interfaces/Notification.interface";
import sequelizeSystem from "../database/connect";
import User from "./User.model";

class Notification
  extends Model<NotificationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number;
  public name!: string;
  public content!: string;
  public type!: string;
  public readonly createdAt!: Date;
}

Notification.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeSystem,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
    updatedAt: false,
  }
);

export default Notification;
