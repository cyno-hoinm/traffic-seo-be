import { DataTypes, Model } from "sequelize";
import { TransactionAttributes } from "../interfaces/Transaction.interface";
import { sequelizeSystem } from "./index.model";
import { TransactionStatus } from "../enums/transactionStatus.enum";
import Wallet from "./Wallet.model";

class Transaction
  extends Model<TransactionAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public walletId!: number;
  public amount!: number;
  public status!: TransactionStatus;
  public date!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Wallet,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    modelName: "Transaction",
    tableName: "transactions",
    timestamps: true,
  }
);

export default Transaction;
