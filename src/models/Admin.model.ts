import { DataTypes, Model } from "sequelize";
import {
  AdminAttributes,
  AdminCreationAttributes,
} from "../interfaces/Admin.interface";
import sequelizeSystem from "../database/connect";

class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  public id!: number;
  public email!: string;
  public password!: string;
  public walletBalance!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    walletBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: sequelizeSystem,
    tableName: "admins",
    timestamps: true,
  }
);

export default Admin;
