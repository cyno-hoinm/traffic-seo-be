import { DataTypes, Model } from "sequelize";
import { sequelizeSystem } from "./index.model";
import { RolePermissionAttributes } from "../interfaces/RolePermission.interface";

class RolePermission
  extends Model<RolePermissionAttributes>
  implements RolePermissionAttributes
{
  public id!: number;
  public roleId!: number;
  public permissionId!: number;
  public isDeleted!: boolean;
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
      allowNull: true,
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    modelName: "RolePermission",
    tableName: "rolePermissions",
    timestamps: true,
  }
);

export default RolePermission;
