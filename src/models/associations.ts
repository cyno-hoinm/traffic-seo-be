// src/models/associations.ts
import User from "./User.model";
import Role from "./Role.model";
import Permission from "./Permission.model";
import RolePermission from "./RolePermission.model";
import Notification from "./Notification.model";
import Wallet from "./Wallet.model";
import Transaction from "./Transaction.model";
import Voucher from "./Voucher.model";
import Deposit from "./Deposit.model";
import Campaign from "./Campaign.model";
import Link from "./Link.model";
import Keyword from "./Keyword.model";
import Country from "./Country.model";

export const initAssociations = () => {
  // User - Role (N:1)
  User.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
    onDelete: "RESTRICT", // Prevent deleting a role if users are associated
  });
  Role.hasMany(User, {
    foreignKey: "roleId",
    as: "users",
  });

  // Role - RolePermission (1:N)
  Role.hasMany(RolePermission, {
    foreignKey: "roleId",
    as: "rolePermissions",
    onDelete: "CASCADE", // Delete role permissions if the role is deleted
  });
  RolePermission.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  });

  // Permission - RolePermission (1:N)
  Permission.hasMany(RolePermission, {
    foreignKey: "permissionId",
    as: "rolePermissions",
    onDelete: "CASCADE", // Delete role permissions if the permission is deleted
  });
  RolePermission.belongsTo(Permission, {
    foreignKey: "permissionId",
    as: "permission",
  });

  // User - Notification (1:N)
  User.hasMany(Notification, {
    foreignKey: "userId",
    as: "notifications",
    onDelete: "CASCADE", // Delete notifications if the user is deleted
  });
  Notification.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // User - Wallet (1:1)
  User.hasOne(Wallet, {
    foreignKey: "userId",
    as: "wallet",
    onDelete: "CASCADE", // Delete wallet if the user is deleted
  });
  Wallet.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Wallet - Transaction (1:N)
  Wallet.hasMany(Transaction, {
    foreignKey: "walletId",
    as: "transactions",
    onDelete: "CASCADE", // Delete transactions if the wallet is deleted
  });
  Transaction.belongsTo(Wallet, {
    foreignKey: "walletId",
    as: "wallet",
  });

  // User - Deposit (1:N)
  User.hasMany(Deposit, {
    foreignKey: "userId",
    as: "deposits",
    onDelete: "CASCADE", // Delete deposits if the user is deleted
  });
  Deposit.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Voucher - Deposit (1:N)
  Voucher.hasMany(Deposit, {
    foreignKey: "voucherId",
    as: "deposits",
    onDelete: "RESTRICT", // Prevent deleting a voucher if deposits are associated
  });
  Deposit.belongsTo(Voucher, {
    foreignKey: "voucherId",
    as: "voucher",
  });

  // User - Campaign (1:N)
  User.hasMany(Campaign, {
    foreignKey: "userId",
    as: "campaigns",
    onDelete: "CASCADE", // Delete campaigns if the user is deleted
  });
  Campaign.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Country - Campaign (1:N)
  Country.hasMany(Campaign, {
    foreignKey: "countryId",
    as: "campaigns",
    onDelete: "RESTRICT", // Prevent deleting a country if campaigns are associated
  });
  Campaign.belongsTo(Country, {
    foreignKey: "countryId",
    as: "country",
  });

  // Campaign - Link (1:N)
  Campaign.hasMany(Link, {
    foreignKey: "campaignId",
    as: "links",
    onDelete: "CASCADE", // Delete links if the campaign is deleted
  });
  Link.belongsTo(Campaign, {
    foreignKey: "campaignId",
    as: "campaign",
  });

  // Campaign - Keyword (1:N)
  Campaign.hasMany(Keyword, {
    foreignKey: "campaignId",
    as: "keywords",
    onDelete: "CASCADE", // Delete keywords if the campaign is deleted
  });
  Keyword.belongsTo(Campaign, {
    foreignKey: "campaignId",
    as: "campaign",
  });
};
