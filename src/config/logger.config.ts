import winston from "winston";
import path from "path";
import dotenv from "dotenv";
import LogLevel from "../types/LogLevel.type";
import { colors, emoji, levels } from "../constants/statusCodeColor";

dotenv.config();

const logDir = path.join(process.cwd(), "/src/logs");

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info: any) => {
    const message = `${info.timestamp} ${info.level}: ${info.message}`;
    return `${emoji[info.level as LogLevel] || ""} ${message}`;
  })
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(logDir, "all.log"),
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels: levels,
  format,
  transports,
});

