import { DataTypes, Model } from "sequelize";
import { WalletAttributes } from "../interfaces/Wallet.interface";
import { sequelizeSystem } from "../database/config.database";
import User from "./User.model";

class Wallet extends Model<WalletAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public balance!: number;
  public isDeleted!: boolean;
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
      allowNull: true,
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
      get() {
        const rawValue = this.getDataValue("createdAt") as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace("Z", "");
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "Wallet",
    tableName: "wallets",
    timestamps: true,
  }
);

export default Wallet;
