import { Sequelize,QueryTypes } from "sequelize";
import cron from "node-cron";
import { config } from "dotenv";
import { sequelizeSystem } from "../models/index.model";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUser,
  MAX_BACKUPS,
} from "../database/mySQL/config.database";

config();

// Generate a unique backup database name with timestamp
function generateBackupDbName() {
  const timestamp = new Date().toISOString().replace(/[:.T-]/g, "_");
  return `backup_${dbName}_${timestamp}`.slice(0, 63);
}
// Create a new backup database and copy schema/data using Sequelize
async function createBackup() {
    const backupDbName: any = generateBackupDbName();
    try {
      // Create new database
      await sequelizeSystem.query(`CREATE DATABASE "${backupDbName}"`);
      // console.log(`Backup database created: ${backupDbName}`);
  
      // Connect to the source database
      const sourceSequelize: any = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: false,
      });
  
      // Connect to the new backup database
      const backupSequelize: any = new Sequelize(backupDbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: false,
      });
  
      // Step 1: Get list of tables from the source database
      const tables: any = await sourceSequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `, { type: QueryTypes.SELECT });
  
      // Debug: Log the tables result to inspect its structure
      // console.log('Tables result:', tables);
  
      // Ensure tables is an array and map to table names
      if (!Array.isArray(tables)) {
        throw new Error('Expected tables to be an array, got: ' + JSON.stringify(tables));
      }
  
      const tableNames: any = tables.map((row: any) => row.table_name);
      // console.log('Table names:', tableNames);
  
      // Step 2: Copy sequences
      const sequences: any = await sourceSequelize.query(`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
      `, { type: QueryTypes.SELECT });
  
      for (const seq of sequences) {
        const sequenceName: any = seq.sequence_name;
        // Debug: Log the sequence name
        // console.log(`Processing sequence: ${sequenceName}`);
  
        // Get sequence definition (table, column, and last value)
        const seqDefs: any = await sourceSequelize.query(`
          SELECT table_name, column_name, 
                 pg_sequence_last_value(quote_ident(:sequenceName)) AS last_value
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND data_type IN ('integer', 'bigint') 
          AND column_default LIKE 'nextval%'
          AND pg_get_serial_sequence(quote_ident(table_name), quote_ident(column_name)) = :sequenceName
        `, {
          replacements: { sequenceName },
          type: QueryTypes.SELECT,
        });
  
        // Debug: Log sequence definitions
        // console.log(`Sequence ${sequenceName} definitions:`, seqDefs);
  
        for (const seqDef of seqDefs) {
          if (seqDef.table_name && seqDef.column_name) {
            const createSeqSQL: any = `CREATE SEQUENCE "${sequenceName}" START WITH ${seqDef.last_value || 1}`;
            // console.log(`Executing sequence SQL: ${createSeqSQL}`);
            await backupSequelize.query(createSeqSQL);
            // console.log(`Created sequence "${sequenceName}" for table "${seqDef.table_name}" in ${backupDbName}`);
          }
        }
      }
  
      // Step 3: Copy schema (create tables)
      for (const tableName of tableNames) {
        // Get column definitions from information_schema
        const columns: any = await sourceSequelize.query(`
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = :tableName
        `, {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        });
  
        // Debug: Log column names
        // console.log(`Columns for "${tableName}":`, columns.map((col: any) => col.column_name));
  
        // Build CREATE TABLE statement
        const columnDefs: any = columns.map((col: any) => {
          let def = `"${col.column_name}" ${col.data_type}`;
          if (col.character_maximum_length) {
            def += `(${col.character_maximum_length})`;
          }
          if (col.data_type === 'integer' && col.column_default && col.column_default.includes('nextval')) {
            def = `"${col.column_name}" SERIAL`; // Use SERIAL for auto-increment
          } else if (col.data_type === 'bigint' && col.column_default && col.column_default.includes('nextval')) {
            def = `"${col.column_name}" BIGSERIAL`; // Use BIGSERIAL for auto-increment
          } else {
            def += col.is_nullable === 'NO' ? ' NOT NULL' : '';
            if (col.column_default && !col.column_default.includes('nextval')) {
              def += ` DEFAULT ${col.column_default}`;
            }
          }
          return def;
        }).join(', ');
  
        const createTableSQL: any = `
          CREATE TABLE "${tableName}" (
            ${columnDefs}
          )
        `;
  
        // Debug: Log the CREATE TABLE SQL
        // console.log(`Executing CREATE TABLE SQL: ${createTableSQL}`);
        await backupSequelize.query(createTableSQL);
        // console.log(`Created table "${tableName}" in ${backupDbName}`);
      }
  
      // Step 4: Copy data
      for (const tableName of tableNames) {
        // Get column definitions from information_schema
        const columns: any = await sourceSequelize.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = :tableName
        `, {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        });
  
        const validColumns: any = columns.map((col: any) => col.column_name);
        // console.log(`Valid columns for "${tableName}":`, validColumns);
  
        if (validColumns.length === 0) {
          console.warn(`No columns found for "${tableName}", skipping data copy`);
          continue;
        }
  
        // Explicitly select only valid columns
        const selectColumnsSQL: any = validColumns.map((col: any) => `"${col}"`).join(', ');
        // console.log(`SELECT columns SQL for "${tableName}":`, selectColumnsSQL);
  
        const rows: any = await sourceSequelize.query(
          `SELECT ${selectColumnsSQL} FROM "${tableName}"`,
          { type: QueryTypes.SELECT }
        );
  
        if (rows.length > 0) {
          // Use validColumns directly for INSERT statement
          const columnsSQL: any = validColumns.map((col: any) => `"${col}"`).join(', ');
          // console.log(`INSERT columns SQL for "${tableName}":`, columnsSQL);
  
          const values: any = rows
            .map((row: any) => {
              return `(${validColumns
                .map((col: any) => {
                  const val = row[col];
                  if (val === null) return 'NULL';
                  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                  return val;
                })
                .join(', ')})`;
            })
            .join(', ');
  
          const insertSQL: any = `
            INSERT INTO "${tableName}" (${columnsSQL})
            VALUES ${values}
          `;
  
          // Debug: Log the INSERT SQL
          // console.log(`Executing INSERT SQL: ${insertSQL}`);
          await backupSequelize.query(insertSQL);
          // console.log(`Copied ${rows.length} rows to "${tableName}" in ${backupDbName}`);
        }
      }
  
      // Step 5: Copy indexes, constraints, and triggers
      for (const tableName of tableNames) {
        // Function to quote all table names in SQL
        const quoteTableNames = (sql: string) => {
          let modifiedSQL = sql;
          for (const tn of tableNames) {
            const escapedTableName = tn.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            modifiedSQL = modifiedSQL.replace(
              new RegExp(`\\b${escapedTableName}\\b`, 'g'),
              `"${tn}"`
            );
          }
          return modifiedSQL;
        };
  
        // Get indexes
        const indexes: any = await sourceSequelize.query(`
          SELECT indexdef 
          FROM pg_indexes 
          WHERE schemaname = 'public' AND tablename = :tableName
        `, {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        });
        for (const index of indexes) {
          const indexSQL: any = quoteTableNames(index.indexdef);
          // console.log(`Executing index SQL: ${indexSQL}`);
          await backupSequelize.query(indexSQL);
          // console.log(`Created index for "${tableName}" in ${backupDbName}`);
        }
  
        // Get constraints (e.g., foreign keys, primary keys)
        const constraints: any = await sourceSequelize.query(`
          SELECT pg_get_constraintdef(c.oid) AS constraint_def
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE t.relname = :tableName AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        `, {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        });
        for (const constraint of constraints) {
          const constraintSQL: any = quoteTableNames(
            `ALTER TABLE "${tableName}" ADD ${constraint.constraint_def}`
          );
          // console.log(`Executing constraint SQL: ${constraintSQL}`);
          await backupSequelize.query(constraintSQL);
          // console.log(`Added constraint to "${tableName}" in ${backupDbName}`);
        }
  
        // Get triggers
        const triggers: any = await sourceSequelize.query(`
          SELECT pg_get_triggerdef(t.oid) AS trigger_def
          FROM pg_trigger t
          JOIN pg_class c ON t.tgrelid = c.oid
          WHERE c.relname = :tableName AND t.tgrelid = c.oid 
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        `, {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        });
        for (const trigger of triggers) {
          const triggerSQL: any = quoteTableNames(trigger.trigger_def);
          // console.log(`Executing trigger SQL: ${triggerSQL}`);
          await backupSequelize.query(triggerSQL);
          // console.log(`Created trigger for "${tableName}" in ${backupDbName}`);
        }
      }
  
      // Close database connections
      await sourceSequelize.close();
      await backupSequelize.query('COMMIT');
      await backupSequelize.close();
  
      // Manage backups to keep only the latest MAX_BACKUPS
      await manageBackups();
    } catch (error) {
      console.error(`Error creating backup ${backupDbName}:`, error);
      // Cleanup: Drop the backup database if it was created
      await sequelizeSystem.query(`DROP DATABASE IF EXISTS "${backupDbName}"`);
      throw error;
    }
  }

// Manage backup databases to keep only the latest MAX_BACKUPS
async function manageBackups(): Promise<void> {
  try {
    // Query all databases matching the backup pattern
    const result = await sequelizeSystem.query(
      `SELECT datname FROM pg_database WHERE datname LIKE 'backup_${dbName}%'`
    );

    // Sort backup databases by timestamp (newest first)
    const backupDbs = (result[0] as { datname: string }[])
      .map((row) => row.datname)
      .sort((a, b) => {
        const timeA = a.match(/backup_.*_([\d-T]+)\-/)?.[1];
        const timeB = b.match(/backup_.*_([\d-T]+)\-/)?.[1];
        if (!timeA || !timeB) return 0; // Handle invalid timestamps
        return new Date(timeB).getTime() - new Date(timeA).getTime(); // Compare timestamps
      });

    // Drop older databases if exceeding MAX_BACKUPS
    if (backupDbs.length > MAX_BACKUPS) {
      const dbsToDelete = backupDbs.slice(MAX_BACKUPS);
      for (const db of dbsToDelete) {
        await sequelizeSystem.query(`DROP DATABASE IF EXISTS "${db}"`);
        // console.log(`Deleted old backup database: ${db}`);
      }
    }
  } catch (error) {
    console.error("Error managing backups:", error);
    throw error;
  }
}

// Test database connection
async function testConnection() {
  try {
    await sequelizeSystem.authenticate();
    // console.log("Database connections established successfully.");
  } catch (error) {
    // console.error("Unable to connect to databases:", error);
    throw error;
  }
}

// Initialize and start backup service
export async function startBackupService() {
  try {
    await testConnection();

    // Schedule backup every 2 hours
    cron.schedule("0 */2 * * *", async () => {
      // console.log("Starting scheduled backup...");
      await createBackup();
    });

    // console.log("Backup service started. Backups will run every 2 hours.");

    // Run initial backup
    await createBackup();
  } catch (error) {
    console.error("Failed to start backup service:", error);
    process.exit(1);
  } finally {
    // Close admin connection
    await sequelizeSystem.close();
  }
}
