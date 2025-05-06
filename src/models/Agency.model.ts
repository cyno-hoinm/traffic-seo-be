import { DataTypes, Model } from "sequelize";
import { AgencyAttributes } from "../interfaces/Agency.interface";
import { sequelizeSystem, User} from "./index.model"

class Agency extends Model<AgencyAttributes> implements AgencyAttributes {
  public id!: number;
  public userId!: number;
  public inviteCode!: string;
  public bankName!: string;
  public bankAccount!: string;
  public accountHolder!: string;
  public isDeleted!: boolean;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Agency.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      }
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankAccount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountHolder: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
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
      modelName: "Agency",
      tableName: "agencies",
      timestamps: true,
  }
);

export default Agency
