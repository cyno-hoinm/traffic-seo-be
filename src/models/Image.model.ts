// create image model
import { ImageType } from "../enums/imageType.enum";
import { ImageAttributes } from "../interfaces/Image.interface";
import { DataTypes, Model } from "sequelize";
import { sequelizeSystem } from "./index.model";

class Image extends Model<ImageAttributes> implements ImageAttributes {
  public id!: number;
  public type!: ImageType;
  public imageUrl!: string;
  public imageBase64!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Image.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    imageBase64: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeSystem,
    modelName: "Image",
    tableName: "images",
    timestamps: true,
  }
);

export default Image;
