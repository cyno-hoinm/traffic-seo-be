import { DataTypes, Model } from "sequelize";
import { UserAttributes } from "../interfaces/User.interface";
import { sequelizeSystem, Wallet } from "./index.model";

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public roleId!: number;
  public isDeleted!: boolean;
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
      defaultValue: 2, // Customer
    },
     isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      afterCreate: async (user) => {
        if (user.roleId === 2) {
          // Check if roleId is 2 (Customer)
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
