import { DataTypes, Model } from "sequelize";
import { WalletAttributes } from "../interfaces/Wallet.interface";
import sequelizeSystem from "../database/connect";
import User from "./User.model";

class Wallet extends Model<WalletAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public balance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    modelName: "Wallet",
    tableName: "wallets",
    timestamps: true,
  }
);

export default Wallet;
