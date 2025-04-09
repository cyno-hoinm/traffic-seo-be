import { DataTypes, Model } from "sequelize";
import sequelizeSystem from "../database/connect";
import Campaign from "./Campaign.model";
import { KeywordAttributes } from "../interfaces/Keyword.interface";

class Keyword extends Model<KeywordAttributes> implements KeywordAttributes {
    public id!: number;
    public campaignId!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }
  
  Keyword.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Campaign,
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      sequelize:sequelizeSystem,
      modelName: "Keyword",
      tableName: "keywords",
      timestamps: true,
    }
  );
  
  export default Keyword;