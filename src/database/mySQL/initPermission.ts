import { sequelizeSystem } from "./config.database";

// Translation mappings (as defined above)
const actionTranslations: { [key: string]: string } = {
  /* ... */
};
const resourceTranslations: { [key: string]: string } = {
  /* ... */
};

function generateVietnameseName(code: string): string {
  const parts = code.split("-");
  let action = parts[0];
  let resource = parts.slice(1).join("-");

  if (code === "read-deposit-admin") return "Đọc Tiền gửi (Quản trị)";
  if (code === "read-deposit-user") return "Đọc Tiền gửi (Người dùng)";

  const actionVN = actionTranslations[action] || action;
  const resourceVN =
    resourceTranslations[resource] || resource.replace(/-/g, " ");

  return `${actionVN} ${resourceVN}`.trim();
}

const permissionCodes = [
  "read-wallets",
  "read-wallet",
  "update-wallet",
  "delete-wallet",
  "create-voucher",
  "read-vouchers",
  "read-voucher",
  "update-voucher",
  "delete-voucher",
  "search-users",
  "create-user",
  "read-user",
  "read-users",
  "update-user",
  "delete-user",
  "create-transaction",
  "search-transactions",
  "read-transaction",
  "create-role",
  "read-role",
  "read-roles",
  "update-role",
  "delete-role",
  "create-role-permission",
  "read-role-permission",
  "read-role-permissions",
  "update-role-permission",
  "delete-role-permission",
  "read-report",
  "create-permission",
  "read-permission",
  "read-permissions",
  "update-permission",
  "delete-permission",
  "search-links",
  "create-link",
  "read-link",
  "update-link",
  "search-keywords",
  "create-keyword",
  "read-keyword",
  "update-keyword",
  "search-deposits",
  "create-deposit",
  "read-deposit-admin",
  "read-deposit-user",
  "create-country",
  "read-countries",
  "read-country",
  "update-country",
  "delete-country",
  "read-bot-keywords",
];

// Initialize permissions with raw SQL
export async function initializePermissions() {
  try {

    // Insert each permission with ON CONFLICT DO NOTHING
    for (const code of permissionCodes) {
      const name = generateVietnameseName(code);
      // Escape single quotes in name to prevent SQL injection
      const escapedName = name.replace(/'/g, "''");
      const escapedCode = code.replace(/'/g, "''");

      const query = `
        INSERT INTO permissions (name, code, "isDeleted", "createdAt", "updatedAt")
        VALUES (
          '${escapedName}',
          '${escapedCode}',
          FALSE,
          CURRENT_TIMESTAMP + INTERVAL '7 hours',
          CURRENT_TIMESTAMP + INTERVAL '7 hours'
        )
        ON CONFLICT (code) DO NOTHING
        RETURNING id;
      `;

      await sequelizeSystem.query(query);
    }


  } catch (error: any) {
    // Remove console.error("Lỗi khi khởi tạo quyền:", error);
  }
}


