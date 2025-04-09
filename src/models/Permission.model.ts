import { DataTypes, Model } from "sequelize";
import sequelizeSystem from "../database/connect";
import { PermissionAttributes } from "../interfaces/Permission.interface";

class Permission
  extends Model<PermissionAttributes>
  implements PermissionAttributes
{
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeSystem,
    modelName: "Permission",
    tableName: "permissions",
    timestamps: true,
  }
);

export default Permission;
