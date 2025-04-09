import { DataTypes, Model } from "sequelize";
import {
  SEOerAttributes,
  SEOerCreationAttributes,
} from "../interfaces/SEOer.interface";
import { sequelizeSystem } from "../database/connect";
class SEOer
  extends Model<SEOerAttributes, SEOerCreationAttributes>
  implements SEOerAttributes
{
  public id!: number;
  public email!: string;
  public password!: string;
  public walletBalance!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

SEOer.init(
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
    tableName: "seoers",
    timestamps: true,
  }
);

export default SEOer;
