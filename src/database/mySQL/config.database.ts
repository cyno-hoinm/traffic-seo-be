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
