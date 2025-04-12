import { DataTypes, Model } from "sequelize";
import { sequelizeSystem } from "./index.model";
import { PaymentMethodAttributes } from "../interfaces/PaymentMethod.interface";

class PaymentMethod extends Model<PaymentMethodAttributes> implements PaymentMethodAttributes {
  public id!: number;
  public name!: string;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentMethod.init(
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const rawValue = this.getDataValue('createdAt') as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace('Z', '');
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const rawValue = this.getDataValue('updatedAt') as Date;
        if (!rawValue) return null;
        const adjustedDate = new Date(rawValue);
        adjustedDate.setHours(adjustedDate.getHours() + 7);
        return adjustedDate.toISOString().replace('Z', '');
      },
    },
  },
  {
    sequelize: sequelizeSystem,
    modelName: "PaymentMethod",
    tableName: "paymentMethods",
    timestamps: true,
  }
);

export default PaymentMethod;
