import { DataTypes, Model } from "sequelize";
import { UserAttributes } from "../interfaces/User.interface";
import { Role, sequelizeSystem, Wallet } from "./index.model";


class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public roleId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
      defaultValue: 2, // Customer
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
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      afterCreate: async (user, options) => {
        if (user.roleId === 2) { // Check if roleId is 2 (Customer)
          try {
            await Wallet.create({
              userId: user.id, // Link wallet to the newly created user
              balance: 0, // Default balance
            });
            console.log(`Wallet created for user ${user.id} with roleId 2`);
          } catch (error) {
            console.error(`Error creating wallet for user ${user.id}:`, error);
            throw error; // Rethrow to rollback transaction if used
          }
        }
      },
    },
  }
);

export default User;
