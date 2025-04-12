module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update Users.roleId
    await queryInterface.changeColumn("Users", "roleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Roles", key: "id" },
    });
    // Update Wallets.userId
    await queryInterface.changeColumn("Wallets", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Users", key: "id" },
    });
    // Update Campaigns.countryId
    await queryInterface.changeColumn("Campaigns", "countryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Countries", key: "id" },
    });
    // Update Campaigns.userId
    await queryInterface.changeColumn("Campaigns", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Users", key: "id" },
    });
    // Update Deposits.userId
    await queryInterface.changeColumn("Deposits", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Users", key: "id" },
    });
    // Update Deposits.voucherId
    await queryInterface.changeColumn("Deposits", "voucherId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Vouchers", key: "id" },
    });
    // Update Deposits.paymentMethodId
    await queryInterface.changeColumn("Deposits", "paymentMethodId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "PaymentMethods", key: "id" },
    });
    // Update Keywords.campaignId
    await queryInterface.changeColumn("Keywords", "campaignId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Campaigns", key: "id" },
    });
    // Update Links.campaignId
    await queryInterface.changeColumn("Links", "campaignId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Campaigns", key: "id" },
    });
    // Update RolePermissions.roleId
    await queryInterface.changeColumn("RolePermissions", "roleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Roles", key: "id" },
    });
    // Update RolePermissions.permissionId
    await queryInterface.changeColumn("RolePermissions", "permissionId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Permissions", key: "id" },
    });
    // Update Notifications.userId
    await queryInterface.changeColumn("Notifications", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Users", key: "id" },
    });
    // Update Transactions.walletId
    await queryInterface.changeColumn("Transactions", "walletId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
      references: { model: "Wallets", key: "id" },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Users");
  },
};
