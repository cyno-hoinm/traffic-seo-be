import { Sequelize, QueryTypes } from "sequelize";
import cron from "node-cron";
import { config } from "dotenv";
import { sequelizeSystem } from "../models/index.model";

import { logger } from "../config/logger.config";
import { connectDB } from "../database/mySQL/connect";
import { generateBackupDbName } from "../utils/generate";
import { dbHost, dbName, dbPassword, dbPort, dbUser, MAX_BACKUPS } from "../config/database.config";

config();

// Generate a unique backup database name with timestamp

// Create a new backup database and copy schema/data using Sequelize
async function createBackup() {
  const backupDbName = generateBackupDbName(dbName);
  let sourceSequelize: Sequelize | null = null;
  let backupSequelize: Sequelize | null = null;

  try {
    // Create new database
    await sequelizeSystem.query(`CREATE DATABASE \`${backupDbName}\``);
    // logger.info(`Backup database ${backupDbName} created`);

    // Connect to the source database
    sourceSequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });

    // Connect to the new backup database
    backupSequelize = new Sequelize(backupDbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });

    // Step 1: Get list of tables from the source database
    const tables = await sourceSequelize.query(
      `SELECT TABLE_NAME 
       FROM information_schema.tables 
       WHERE TABLE_SCHEMA = :dbName 
       AND TABLE_TYPE = 'BASE TABLE'`,
      {
        replacements: { dbName },
        type: QueryTypes.SELECT,
      }
    );

    const tableNames = tables
      .map((row: any) => row.TABLE_NAME)
      .filter((name) => name);

    if (!tableNames.length) {
      throw new Error("No tables found in the source database.");
    }
    // logger.info(`Found ${tableNames.length} tables to backup`);

    // Step 2: Copy schema (create tables)
    for (const tableName of tableNames) {
      // Get column definitions
      const columns = await sourceSequelize.query(
        `SELECT 
           COLUMN_NAME,
           DATA_TYPE,
           CHARACTER_MAXIMUM_LENGTH,
           IS_NULLABLE,
           COLUMN_DEFAULT,
           EXTRA
         FROM information_schema.columns
         WHERE TABLE_SCHEMA = :dbName AND TABLE_NAME = :tableName`,
        {
          replacements: { dbName, tableName },
          type: QueryTypes.SELECT,
        }
      );

      const columnDefs = columns
        .map((col: any) => {
          let def = `\`${col.COLUMN_NAME}\` ${col.DATA_TYPE}`;
          if (col.CHARACTER_MAXIMUM_LENGTH) {
            def += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
          }
          def += col.IS_NULLABLE === "NO" ? " NOT NULL" : "";
          if (col.EXTRA.includes("auto_increment")) {
            def += " AUTO_INCREMENT";
          } else if (col.COLUMN_DEFAULT !== null) {
            def += ` DEFAULT ${col.COLUMN_DEFAULT}`;
          }
          return def;
        })
        .join(", ");

      // Get primary key
      const primaryKeys = await sourceSequelize.query(
        `SELECT COLUMN_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = :dbName 
         AND TABLE_NAME = :tableName 
         AND CONSTRAINT_NAME = 'PRIMARY'`,
        {
          replacements: { dbName, tableName },
          type: QueryTypes.SELECT,
        }
      );

      const primaryKeyDef =
        primaryKeys.length > 0
          ? `, PRIMARY KEY (${primaryKeys
              .map((pk: any) => `\`${pk.COLUMN_NAME}\``)
              .join(", ")})`
          : "";

      const createTableSQL = `
        CREATE TABLE \`${tableName}\` (
          ${columnDefs}${primaryKeyDef}
        )
      `;
      await backupSequelize.query(createTableSQL);
      // logger.info(`Created table ${tableName} in ${backupDbName}`);
    }

    // Step 3: Copy data
    for (const tableName of tableNames) {
      const columns = await sourceSequelize.query(
        `SELECT COLUMN_NAME, DATA_TYPE
         FROM information_schema.columns
         WHERE TABLE_SCHEMA = :dbName AND TABLE_NAME = :tableName`,
        {
          replacements: { dbName, tableName },
          type: QueryTypes.SELECT,
        }
      );

      const validColumns = columns
        .map((col: any) => col.COLUMN_NAME)
        .filter((name) => name);

      if (validColumns.length === 0) {
        // logger.warn(`No columns found for ${tableName}, skipping data copy`);
        continue;
      }

      const columnTypes = new Map<string, string>(
        columns.map((col: any) => [col.COLUMN_NAME, col.DATA_TYPE.toLowerCase()])
      );

      const selectColumnsSQL = validColumns.map((col: string) => `\`${col}\``).join(", ");
      const rows = await sourceSequelize.query(
        `SELECT ${selectColumnsSQL} FROM \`${tableName}\``,
        { type: QueryTypes.SELECT }
      );

      if (rows.length > 0) {
        const columnsSQL = validColumns.map((col: string) => `\`${col}\``).join(", ");
        const values = rows
          .map((row: any) => {
            return `(${validColumns
              .map((col: string) => {
                const val = row[col];
                const colType = columnTypes.get(col);

                if (val === null) return "NULL";

                if (colType === "datetime" || colType === "timestamp") {
                  if (val instanceof Date) {
                    const year = val.getFullYear();
                    const month = String(val.getMonth() + 1).padStart(2, "0");
                    const day = String(val.getDate()).padStart(2, "0");
                    const hours = String(val.getHours()).padStart(2, "0");
                    const minutes = String(val.getMinutes()).padStart(2, "0");
                    const seconds = String(val.getSeconds()).padStart(2, "0");
                    return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}'`;
                  } else if (typeof val === "string") {
                    const date = new Date(val);
                    if (!isNaN(date.getTime())) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      const seconds = String(date.getSeconds()).padStart(2, "0");
                      return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}'`;
                    }
                  }
                  // logger.warn(`Invalid date value for column "${col}" in table "${tableName}": ${val}`);
                  return "NULL";
                }

                if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
                if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return val;
              })
              .join(", ")})`;
          })
          .join(", ");

        const insertSQL = `
          INSERT INTO \`${tableName}\` (${columnsSQL})
          VALUES ${values}
        `;
        await backupSequelize.query(insertSQL);
        // logger.info(`Copied ${rows.length} rows to ${tableName} in ${backupDbName}`);
      }
    }

    // Step 4: Copy indexes, constraints, and triggers
    for (const tableName of tableNames) {
      const indexesRaw: any = await sourceSequelize.query(
        `SHOW INDEXES FROM \`${tableName}\` WHERE KEY_NAME != 'PRIMARY'`,
        { type: QueryTypes.SELECT }
      );

      const indexesByKey: { [key: string]: any[] } = {};
      for (const index of indexesRaw) {
        const keyName = index["Key_name"];
        if (!indexesByKey[keyName]) {
          indexesByKey[keyName] = [];
        }
        indexesByKey[keyName].push(index);
      }

      for (const keyName in indexesByKey) {
        const indexRows = indexesByKey[keyName];
        const firstIndex = indexRows[0];
        const nonUnique = firstIndex["Non_unique"];
        const indexType =
          firstIndex["Index_type"] === "FULLTEXT"
            ? "FULLTEXT"
            : nonUnique
            ? "" // Non-unique index, no keyword needed
            : "UNIQUE";

        const columnNames = indexRows
          .sort((a: any, b: any) => a["Seq_in_index"] - b["Seq_in_index"])
          .map((index: any) => `\`${index["Column_name"]}\``)
          .join(", ");

        const indexSQL = `CREATE ${indexType} INDEX \`${keyName}\` ON \`${tableName}\` (${columnNames})`.trim();
        try {
          await backupSequelize.query(indexSQL);
          // logger.info(`Created index ${keyName} for ${tableName} in ${backupDbName}`);
        } catch (error: any) {
          // logger.warn(`Failed to create index ${keyName} for ${tableName}: ${error.message}`);
          // Continue to avoid stopping the backup process
        }
      }

      // Copy foreign key constraints
      const constraints: any = await sourceSequelize.query(
        `SELECT 
           CONSTRAINT_NAME,
           COLUMN_NAME,
           REFERENCED_TABLE_NAME,
           REFERENCED_COLUMN_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = :dbName 
         AND TABLE_NAME = :tableName 
         AND REFERENCED_TABLE_NAME IS NOT NULL`,
        {
          replacements: { dbName, tableName },
          type: QueryTypes.SELECT,
        }
      );

      for (const constraint of constraints) {
        const constraintSQL = `
          ALTER TABLE \`${tableName}\`
          ADD CONSTRAINT \`${constraint.CONSTRAINT_NAME}\`
          FOREIGN KEY (\`${constraint.COLUMN_NAME}\`)
          REFERENCES \`${constraint.REFERENCED_TABLE_NAME}\` (\`${constraint.REFERENCED_COLUMN_NAME}\`)
        `;
        await backupSequelize.query(constraintSQL);
        // logger.info(`Added constraint ${constraint.CONSTRAINT_NAME} to ${tableName} in ${backupDbName}`);
      }

      // Copy triggers
      const triggers: any = await sourceSequelize.query(
        `SELECT TRIGGER_NAME, ACTION_TIMING, EVENT_MANIPULATION, ACTION_STATEMENT
         FROM information_schema.TRIGGERS
         WHERE EVENT_OBJECT_SCHEMA = :dbName 
         AND EVENT_OBJECT_TABLE = :tableName`,
        {
          replacements: { dbName, tableName },
          type: QueryTypes.SELECT,
        }
      );

      for (const trigger of triggers) {
        const triggerSQL = `
          CREATE TRIGGER \`${trigger.TRIGGER_NAME}\`
          ${trigger.ACTION_TIMING} ${trigger.EVENT_MANIPULATION}
          ON \`${tableName}\`
          FOR EACH ROW
          ${trigger.ACTION_STATEMENT}
        `;
        await backupSequelize.query(triggerSQL);
        // logger.info(`Created trigger ${trigger.TRIGGER_NAME} for ${tableName} in ${backupDbName}`);
      }
    }

    // Commit and close connections
    await backupSequelize.query("COMMIT");
    logger.info(`Backup database ${backupDbName} completed successfully`);
    await manageBackups();
  } catch (error: any) {
    // logger.error(`Error creating backup ${backupDbName}: ${error.message}`);
    // Cleanup: Drop the backup database if it was created
    try {
      await sequelizeSystem.query(`DROP DATABASE IF EXISTS \`${backupDbName}\``);
      // logger.info(`Cleaned up incomplete backup database ${backupDbName}`);
    } catch (cleanupError: any) {
      // logger.error(`Failed to clean up backup database ${backupDbName}: ${cleanupError.message}`);
    }
    throw error;
  } finally {
    // Close database connections
    if (sourceSequelize) await sourceSequelize.close();
    if (backupSequelize) await backupSequelize.close();
  }
}

// Manage backup databases to keep only the latest MAX_BACKUPS
async function manageBackups(): Promise<void> {
  // Query all databases matching the backup pattern
  const result = await sequelizeSystem.query(
    `SHOW DATABASES LIKE 'backup_${dbName}%'`,
    {
      type: QueryTypes.SELECT,
    }
  );

  // Sort backup databases by timestamp (newest first)
  const backupDbs = result
    .map((row: any) => Object.values(row)[0] as string)
    .sort((a, b) => {
      const timeA = a.match(/backup_.*_([\d-T]+)_/)?.[1];
      const timeB = b.match(/backup_.*_([\d-T]+)_/)?.[1];
      if (!timeA || !timeB) return 0;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

  // Drop older databases if exceeding MAX_BACKUPS
  if (backupDbs.length > MAX_BACKUPS) {
    const dbsToDelete = backupDbs.slice(MAX_BACKUPS);
    for (const db of dbsToDelete) {
      await sequelizeSystem.query(`DROP DATABASE IF EXISTS \`${db}\``);
      // console.log(`Deleted old backup database: ${db}`);
    }
  }
}
// Initialize and start backup service
export async function startBackupService() {
  try {
    // Connect to the database
    await connectDB();
    logger.info(`Backup database service worker ${process.pid} started`);

    // Schedule backup every 2 hours
    cron.schedule(
      "0 */2 * * *", // Every 2 hours (00:00, 02:00, 04:00, etc.)
      async () => {
        try {
          logger.info("Starting scheduled backup...");
          await createBackup();
          logger.info("Backup completed successfully");
        } catch (error: any) {
          logger.error("Scheduled backup failed:", error.message);
        }
      },
      {
        scheduled: true, // Ensure the task is scheduled
        timezone: "UTC", // Set timezone (adjust as needed, e.g., "Asia/Ho_Chi_Minh")
      }
    );

    // Run initial backup (optional)
    logger.info("Running initial backup...");
    await createBackup();
    logger.info("Initial backup completed");

    logger.info("Backup service started. Backups will run every 2 hours.");
  } catch (error: any) {
    logger.error("Failed to start backup service:", error.message);
    process.exit(1);
  }
  // Note: Do NOT close sequelizeSystem connection here, as cron jobs need it
}
