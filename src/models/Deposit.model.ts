import { DataTypes, Model } from "sequelize";
import { sequelizeSystem, User, Voucher, PaymentMethod } from "./index.model";
import { DepositStatus } from "../enums/depositStatus.enum";
import { DepositAttributes } from "../interfaces/Deposit.interface";

class Deposit extends Model<DepositAttributes> implements DepositAttributes {
  public id!: number;
  public userId!: number;
  public voucherId!: number;
  public paymentMethodId!: number;
  public amount!: number;
  public status!: DepositStatus;
  public acceptedBy?: string;
  public createdBy?: string;
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
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PaymentMethod,
        key: "paymentMethodId"
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DepositStatus)),
      allowNull: false,
    },
    acceptedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const rawValue = this.getDataValue("createdAt") as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace("Z", "+07:00");
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
        return adjustedDate.toISOString().replace("Z", "+07:00");
      },
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
