import { sequelizeSystem } from "../database/config.database";
import Role from "./Role.model";
import Permission from "./Permission.model";
import RolePermission from "./RolePermission.model";
import User from "./User.model";
import Wallet from "./Wallet.model";
import Country from "./Country.model";
import Campaign from "./Campaign.model";
import Deposit from "./Deposit.model";
import Voucher from "./Voucher.model";
import Keyword from "./Keyword.model";
import Link from "./Link.model";
import Notification from "./Notification.model"; // Add Notification
import Transaction from "./Transaction.model"; // Add Transaction

// Initialize models (this ensures they’re loaded)
export const models = {
  Role,
  Permission,
  RolePermission,
  User,
  Wallet,
  Country,
  Campaign,
  Deposit,
  Voucher,
  Keyword,
  Link,
  Notification,
  Transaction,
};

// Define associations
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

User.hasOne(Wallet, { foreignKey: "userId", as: "wallet" });
Wallet.belongsTo(User, { foreignKey: "userId", as: "user" });

Campaign.belongsTo(Country, { foreignKey: "countryId", as: "country" });
Country.hasMany(Campaign, { foreignKey: "countryId", as: "campaigns" });

Campaign.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Campaign, { foreignKey: "userId", as: "campaigns" });

Deposit.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Deposit, { foreignKey: "userId", as: "deposits" });

Deposit.belongsTo(Voucher, { foreignKey: "voucherId", as: "voucher" });
Voucher.hasMany(Deposit, { foreignKey: "voucherId", as: "deposits" });

Keyword.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });
Campaign.hasMany(Keyword, { foreignKey: "campaignId", as: "keywords" });

Link.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });
Campaign.hasMany(Link, { foreignKey: "campaignId", as: "links" });

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

// Notification associations
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

// Transaction associations
Transaction.belongsTo(Wallet, { foreignKey: "walletId", as: "wallet" });
Wallet.hasMany(Transaction, { foreignKey: "walletId", as: "transactions" });

// Export models
export {
  Role,
  Permission,
  RolePermission,
  User,
  Wallet,
  Country,
  Campaign,
  Deposit,
  Voucher,
  Keyword,
  Link,
  Notification,
  Transaction,
  sequelizeSystem,
};