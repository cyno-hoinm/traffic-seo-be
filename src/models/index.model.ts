import { sequelizeSystem } from "../database/mySQL/config.database";
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
import TransactionModel from "./Transaction.model"; // Add Transaction
import PaymentMethod from "./PaymentMethod.model";
import CampaignType from "./CampaignType.model";
import Config from "./Config.model";
import Agency from "./Agency.model"
import Image from "./Image.model"
import Package from "./Package.model"
import Report from "./Report.model"
import DirectLink from "./DirectLink.model";
// Initialize models (this ensures they're loaded)
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
  TransactionModel,
  PaymentMethod,
  CampaignType,
  Config,
  Image,
  Package,
  Report,
  DirectLink
};


// Define associations
// Define associations
User.belongsTo(Role, { foreignKey: "roleId", as: "role", onDelete: 'SET NULL' });
Role.hasMany(User, { foreignKey: "roleId", as: "users", onDelete: 'SET NULL' });

User.hasOne(Wallet, { foreignKey: "userId", as: "wallets", onDelete: 'SET NULL' });
Wallet.belongsTo(User, { foreignKey: "userId", as: "users", onDelete: 'SET NULL' });

Campaign.belongsTo(Country, { foreignKey: "countryId", as: "countries", onDelete: 'SET NULL' });
Country.hasMany(Campaign, { foreignKey: "countryId", as: "campaigns", onDelete: 'SET NULL' });

Campaign.belongsTo(User, { foreignKey: "userId", as: "users", onDelete: 'SET NULL' });
User.hasMany(Campaign, { foreignKey: "userId", as: "campaigns", onDelete: 'SET NULL' });

Deposit.belongsTo(User, { foreignKey: "userId", as: "users", onDelete: 'SET NULL' });
User.hasMany(Deposit, { foreignKey: "userId", as: "deposits", onDelete: 'SET NULL' });

Deposit.belongsTo(Voucher, { foreignKey: "voucherId", as: "vouchers", onDelete: 'SET NULL' });
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

Keyword.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaigns", onDelete: 'SET NULL' });
Campaign.hasMany(Keyword, { foreignKey: "campaignId", as: "keywords", onDelete: 'SET NULL' });

Link.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaigns", onDelete: 'SET NULL' });
Campaign.hasMany(Link, { foreignKey: "campaignId", as: "links", onDelete: 'SET NULL' });

DirectLink.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaigns", onDelete: 'SET NULL' });
Campaign.hasMany(DirectLink, { foreignKey: "campaignId", as: "directLinks", onDelete: 'SET NULL' });

Role.hasMany(RolePermission, { foreignKey: "roleId", as: "rolePermissions", onDelete: 'SET NULL' });
Permission.hasMany(RolePermission, {
  foreignKey: "permissionId",
  as: "rolePermissions",
  onDelete: 'SET NULL',
});
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "roles", onDelete: 'SET NULL' });
RolePermission.belongsTo(Permission, {
  foreignKey: "permissionId",
  as: "permissions",
  onDelete: 'SET NULL',
});

TransactionModel.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet', onDelete: 'SET NULL'  });


User.hasOne(Agency, { foreignKey: "userId", as: "agency", onDelete: 'SET NULL' });
Agency.belongsTo(User, { foreignKey: "userId", as: "users", onDelete: 'SET NULL' });

User.belongsTo(Agency, {
  foreignKey: 'invitedBy',
  as: 'invitedByAgency',
  onDelete: 'SET NULL',
});
// Agency model
Agency.hasMany(User, {
  foreignKey: 'invitedBy',
  as: 'invitedUsers',
});

User.belongsTo(Image, { foreignKey: "imageId", as: "image", onDelete: 'SET NULL' });
Image.hasMany(User, { foreignKey: "imageId", as: "users", onDelete: 'SET NULL' });

User.hasMany(Report, { foreignKey: "userId", as: "reports", onDelete: 'SET NULL' });
Report.belongsTo(User, { foreignKey: "userId", as: "users", onDelete: 'SET NULL' });
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
  TransactionModel,
  PaymentMethod,
  Config,
  Agency,
  Image,
  Package,
  Report,
  DirectLink,
  sequelizeSystem,
};
