import { DataTypes, Model } from "sequelize";
import { sequelizeSystem } from "./index.model";
import { RoleAttributes } from "../interfaces/Role.interface";
class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public isDelete!: boolean;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to initialize roles
  public static async initializeRoles(): Promise<void> {
    try {
      // Ensure the table exists
      await this.sync();

      // Check and create admin role
      const existingAdmin = await this.findOne({ where: { name: "admin" } });
      if (!existingAdmin) {
        await this.create({
          name: "admin",
          isDeleted: false,
        });
      } else {

      }

      // Check and create customer role
      const existingCustomer = await this.findOne({
        where: { name: "customer" },
      });
      if (!existingCustomer) {
        await this.create({
          name: "customer",
          isDeleted: false,
        });

      } else {

      }
    } catch (error: any) {
      console.error("Error initializing roles:", error);
    }
  }
}

Role.init(
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
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
  }
);

// // Run initialization when the model is imported (optional)
// (async () => {
//   await Role.initializeRoles();
// })();

export default Role;
