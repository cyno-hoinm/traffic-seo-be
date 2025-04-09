import { DataTypes, Model } from "sequelize";
import sequelizeSystem from "../database/connect";
import { CountryAttributes } from "../interfaces/Country.interface";

class Country extends Model<CountryAttributes> implements CountryAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Country.init(
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
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeSystem,
    modelName: "Country",
    tableName: "countries",
    timestamps: true,
  }
);

export default Country;
