import { DataTypes, Model } from "sequelize";
import { NotificationAttributes } from "../interfaces/Notification.interface";
import { sequelizeSystem, User } from "./index.model";

class Notification
  extends Model<NotificationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number;
  public name!: string;
  public content!: string;
  public type!: string;
  public isDeleted!: boolean;
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
      allowNull: true,
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
