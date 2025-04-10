import { DataTypes, Model } from "sequelize";
import { sequelizeSystem } from "./../database/connect";
import { VoucherStatus } from "../enums/voucherStatus.enum";
import { VoucherAttributes } from "../interfaces/Voucher.interface";
class Voucher extends Model<VoucherAttributes> implements VoucherAttributes {
  public id!: number;
  public code!: string;
  public value!: number;
  public status!: VoucherStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Voucher.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(VoucherStatus)),
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
    modelName: "Voucher",
    tableName: "vouchers",
    timestamps: true,
  }
);

export default Voucher;
