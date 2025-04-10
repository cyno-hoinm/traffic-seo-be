import { sequelizeSystem } from "../database/config.database";
import Role from "./Role.model";
import Permission from "./Permission.model";
import RolePermission from "./RolePermission.model";
import User from "./User.model";

// Initialize models (this ensures they’re loaded)
const models = {
  Role,
  Permission,
  RolePermission,
  User,
};

// Define associations
User.belongsTo(Role, { foreignKey: "roleId", as: "role" }); // Corrected: User belongs to one Role
Role.hasMany(User, { foreignKey: "roleId", as: "users" }); // Role can have many Users

Role.hasMany(RolePermission, { foreignKey: "roleId", as: "role_permissions" });
Permission.hasMany(RolePermission, {
  foreignKey: "permissionId",
  as: "role_permissions",
});
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "role" });
RolePermission.belongsTo(Permission, {
  foreignKey: "permissionId",
  as: "permission",
});

// Export models
export { Role, Permission, RolePermission, User, sequelizeSystem }; // Added User to exports