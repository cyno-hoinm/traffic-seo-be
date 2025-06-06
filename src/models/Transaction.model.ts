import { DataTypes, Model } from "sequelize";
import { TransactionAttributes } from "../interfaces/Transaction.interface";
import { sequelizeSystem, Wallet } from "./index.model";
import { TransactionStatus } from "../enums/transactionStatus.enum";
import { TransactionType } from "../enums/transactionType.enum";

class Transaction
  extends Model<TransactionAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public walletId!: number;
  public amount!: number;
  public status!: TransactionStatus;
  public type!: TransactionType;
  public isDeleted!: boolean;
  public referenceId!: string | null;
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
      allowNull: true,
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.STRING,
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
    modelName: "Transaction",
    tableName: "transactions",
    timestamps: true,
  }
);

export default Transaction;
