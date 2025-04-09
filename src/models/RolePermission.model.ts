import { DataTypes, Model } from "sequelize";
import sequelizeSystem from "../database/connect";
import Permission from "./Permission.model";
import Role from "./Role.model";
import { RolePermissionAttributes } from "../interfaces/RolePermission.interface";

class RolePermission
  extends Model<RolePermissionAttributes>
  implements RolePermissionAttributes
{
  public id!: number;
  public roleId!: number;
  public permissionId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permission,
        key: "id",
      },
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
    modelName: "RolePermission",
    tableName: "role_permissions",
    timestamps: true,
  }
);

export default RolePermission;
