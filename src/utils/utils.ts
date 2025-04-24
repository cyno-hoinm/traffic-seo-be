import { Server } from "http";
import { logger } from "../config/logger.config";
import { disconnectDB } from "../database/mySQL/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ms from "ms";
import { redisClient } from "../config/redis.config";
import { ttlInSecondsGlobal } from "../constants/redis.constant";
import { LinkAttributes } from "../interfaces/Link.interface";
import { KeywordAttributes } from "../interfaces/Keyword.interface";
import { CampaignMetrics } from "../interfaces/CampaignMetrics.interface";

dotenv.config();
/**
 * Handles graceful shutdown of the application.
 * @param server - The HTTP server instance to close.
 * @param signal - The signal that triggered the shutdown (e.g., SIGTERM, SIGINT).
 */
export async function gracefulShutdown(
  server: Server,
  signal: string
): Promise<void> {
  try {
    server.close(() => {
      logger.info("HTTP server closed");
    });
    await disconnectDB();
    logger.info(`Database connection closed with ${signal}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

export const comparePassword = async (
  password: string,
  hashedPassword: string | ""
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hashedPasswordString = async (
  password: string,
  salt: number | string
): Promise<string> => {
  return await bcrypt.hash(password, salt);
};

/**
 * Signs a JWT token for a user.
 * @param payload - The payload to include in the token (e.g., userId, email).
 * @returns The signed JWT token as a string.
 */
export const signToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET || "DEFAULT_SECRET"; // Ensure fallback works correctly
  const expiresIn = (process.env.JWT_EXPIRES_IN as ms.StringValue) || "1h"; // Default to "1h" if not set

  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};

// Verify and decode a JWT token
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || "DEFAULT_SECRET");
};

// Blacklist a token in Redis
export const blacklistToken = async (
  token: string,
  ttl: number = ttlInSecondsGlobal
): Promise<void> => {
  await redisClient.set(`blackListToken:${token}`, "true", ttl);
};

// Check if a token is blacklisted
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redisClient.get(`blackListToken:${token}`);
  return result === "true";
};

export const removeSensitivity = (payload: any): any => {
  delete payload.iat;
  delete payload.exp;
  delete payload.password;
  return payload;
};

export function parseChargeMoneyString(description: string) {
  // Regex to match the pattern: Charge money - voucher{voucherId} - userId{userId} - createdBy{createdBy}
  const regex = /voucher(\d+)userId(\d+)createdBy(\d+)/;
  const match = description.match(regex);

  if (!match) {
    throw new Error("Invalid description format");
  }

  return {
    voucherId: parseInt(match[1], 10),
    userId: parseInt(match[2], 10),
    createdBy: parseInt(match[3], 10),
  };
}

export const calculateCampaignMetrics = (
  links: LinkAttributes[] = [],
  keywords: KeywordAttributes[] = []
): CampaignMetrics => {
  // Calculate total traffic
  const totalTraffic =
    links.reduce((sum, link) => sum + (Number(link.traffic) || 0), 0) +
    keywords.reduce((sum, keyword) => sum + (Number(keyword.traffic) || 0), 0);

  // Calculate total cost with validation
  const totalCost =
    links.reduce((sum, link) => {
      const cost = Number(link.cost);
      if (isNaN(cost)) {
        console.warn(`Invalid cost for link ${link.id}: ${link.cost}`);
        return sum;
      }
      return sum + cost;
    }, 0) +
    keywords.reduce((sum, keyword) => {
      const cost = Number(keyword.cost);
      if (isNaN(cost)) {
        console.warn(`Invalid cost for keyword ${keyword.id}: ${keyword.cost}`);
        return sum;
      }
      return sum + cost;
    }, 0);

  return {
    totalTraffic,
    totalCost,
  };
};