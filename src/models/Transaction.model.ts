import { DataTypes, Model } from "sequelize";
import {
  TransactionAttributes,
  TransactionCreationAttributes,
} from "../interfaces/Transaction.interface";
import Admin from "./Admin.model";
import SEOer from "./SEOer.model";
import sequelizeSystem from "../database/connect";

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public adminId!: number | null;
  public seoerId!: number | null;
  public amount!: number;
  public txId!: string;
  public type!: string;
  public status!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Admin,
        key: "id",
      },
    },
    seoerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SEOer,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    txId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("deposit"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: sequelizeSystem,
    tableName: "transactions",
    timestamps: true,
  }
);

export default Transaction;
