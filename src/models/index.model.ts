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
import PaymentMethod from "./PaymentMethod.model";
import CampaignType from "./CampaignType.model";

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
  PaymentMethod,
  CampaignType
};


// Define associations
// Define associations
User.belongsTo(Role, { foreignKey: "roleId", as: "role", onDelete: 'SET NULL' });
Role.hasMany(User, { foreignKey: "roleId", as: "users", onDelete: 'SET NULL' });

User.hasOne(Wallet, { foreignKey: "userId", as: "wallet", onDelete: 'SET NULL' });
Wallet.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: 'SET NULL' });

Campaign.belongsTo(Country, { foreignKey: "countryId", as: "country", onDelete: 'SET NULL' });
Country.hasMany(Campaign, { foreignKey: "countryId", as: "campaigns", onDelete: 'SET NULL' });

Campaign.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: 'SET NULL' });
User.hasMany(Campaign, { foreignKey: "userId", as: "campaigns", onDelete: 'SET NULL' });

Deposit.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: 'SET NULL' });
User.hasMany(Deposit, { foreignKey: "userId", as: "deposits", onDelete: 'SET NULL' });

Deposit.belongsTo(Voucher, { foreignKey: "voucherId", as: "voucher", onDelete: 'SET NULL' });
Voucher.hasMany(Deposit, { foreignKey: "voucherId", as: "deposits", onDelete: 'SET NULL' });

Campaign.belongsTo(CampaignType, { foreignKey: "campaignTypeId", as: "campaignTypes", onDelete: "SET NULL" });
CampaignType.hasMany(Campaign, { foreignKey: "campaignTypeId", as: "campaigns", onDelete: "SET NULL" });

Deposit.belongsTo(PaymentMethod, {
  foreignKey: "paymentMethodId",
  as: "paymentMethods",
  onDelete: 'SET NULL',
});
PaymentMethod.hasMany(Deposit, {
  foreignKey: "paymentMethodId",
  as: "deposits",
  onDelete: 'SET NULL',
});

Keyword.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign", onDelete: 'SET NULL' });
Campaign.hasMany(Keyword, { foreignKey: "campaignId", as: "keywords", onDelete: 'SET NULL' });

Link.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign", onDelete: 'SET NULL' });
Campaign.hasMany(Link, { foreignKey: "campaignId", as: "links", onDelete: 'SET NULL' });

Role.hasMany(RolePermission, { foreignKey: "roleId", as: "role_permissions", onDelete: 'SET NULL' });
Permission.hasMany(RolePermission, {
  foreignKey: "permissionId",
  as: "role_permissions",
  onDelete: 'SET NULL',
});
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "role", onDelete: 'SET NULL' });
RolePermission.belongsTo(Permission, {
  foreignKey: "permissionId",
  as: "permission",
  onDelete: 'SET NULL',
});

Notification.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: 'SET NULL' });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications", onDelete: 'SET NULL' });

Transaction.belongsTo(Wallet, { foreignKey: "walletId", as: "wallet", onDelete: 'SET NULL' });
Wallet.hasMany(Transaction, { foreignKey: "walletId", as: "transactions", onDelete: 'SET NULL' });

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
  PaymentMethod,
  sequelizeSystem,
};
