import { DataTypes, Model } from "sequelize";
import sequelizeSystem from "../database/connect";
import { DepositStatus } from "../enums/depositStatus.enum";
import Voucher from "./Voucher.model";
import User from "./User.model";
import { DepositAttributes } from "../interfaces/Deposit.interface";

class Deposit extends Model<DepositAttributes> implements DepositAttributes {
  public id!: number;
  public userId!: number;
  public voucherId!: number;
  public amount!: number;
  public method!: string;
  public status!: DepositStatus;
  public date!: Date;
  public codeTransaction!: string;
  public acceptedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Deposit.init(
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
    voucherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Voucher,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DepositStatus)),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    codeTransaction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acceptedBy: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: "Deposit",
    tableName: "deposits",
    timestamps: true,
  }
);

export default Deposit;
