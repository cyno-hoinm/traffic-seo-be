import { DataTypes, Model } from "sequelize";
import sequelizeSystem from "../database/connect";
import { RoleAttributes } from "../interfaces/Role.interface";

class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public isDelete!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
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
    isDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
  }
);

export default Role;
