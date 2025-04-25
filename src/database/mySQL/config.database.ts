import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import {
  connectTimeoutMS,
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUser,
  maxPoolSize,
  minPoolSize,
  socketTimeoutMS,
} from "../../config/database.config";
import mysql from "mysql2/promise"
dotenv.config();

export const sequelizeSystem = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  logging: false,
  dialect: "mysql",
  timezone: "+07:00",
  pool: {
    max: maxPoolSize,
    min: minPoolSize,
    acquire: socketTimeoutMS,
    idle: connectTimeoutMS,
  },
});

export const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // Increase timeout to 10 seconds
});