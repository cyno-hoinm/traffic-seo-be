import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import {
  connectTimeoutMS,
  maxPoolSize,
  minPoolSize,
  socketTimeoutMS,
} from "../config/database.config";
dotenv.config();
// Validate and parse environment variables
const dbName = process.env.DB_NAME ?? "seo_traffic";
const dbUser = process.env.DB_US ?? "postgres";
const dbPassword = process.env.DB_PW ?? "password";
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = parseInt(process.env.DB_PORT ?? "5432", 10);

console.log('DB Name:', dbName); // Debug
console.log('DB User:', dbUser);
console.log('DB Host:', dbHost);
console.log('DB Port:', dbPort);
// Initialize Sequelize with PostgreSQL
export const sequelizeSystem = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  timezone: "+07:00",
  // logging: (msg: any) => logger.info(msg),
  pool: {
    max: maxPoolSize,
    min: minPoolSize,
    acquire: socketTimeoutMS,
    idle: connectTimeoutMS,
  },
});
