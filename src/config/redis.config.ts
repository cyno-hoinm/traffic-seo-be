import { createClient, RedisClientType } from "redis";
import { logger } from "./logger.config";
import { connectTimeoutMS, defaultRedisPort, eachTimeTry, maxTimeTry, retryTime, ttlInSecondsGlobal } from "../constants/redis.constant";

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    const port = process.env.PORT_REDIS
      ? parseInt(process.env.PORT_REDIS, 10)
      : defaultRedisPort;

    // Validate port
    if (isNaN(port)) {
      logger.error("Invalid Redis port specified in PORT_REDIS");
      throw new Error("Invalid Redis port");
    }

    this.client = createClient({
      username: process.env.REDIS_US || "default", // Redis username
      password: process.env.REDIS_PW || "default_pw", // Redis password
      socket: {
        host: process.env.REDIS_HOST || "localhost", // Redis host
        port, // Redis port
        reconnectStrategy: (retries: number) => {
          if (retries > retryTime) {
            logger.error("Too many Redis reconnection attempts. Giving up.");
            return new Error("Too many retries");
          }
          return Math.min(retries * eachTimeTry, maxTimeTry); // Exponential backoff
        },
        connectTimeout: connectTimeoutMS,
      },
    });

    this.client.on("error", (err) => {
      logger.error("Redis Client Error:", err.message);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      logger.info("Connected to Redis");
      this.isConnected = true;
    });

    this.client.on("end", () => {
      logger.info("Disconnected from Redis");
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.error("Failed to connect to Redis:", error);
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.disconnect();
        this.isConnected = false;
      } catch (error) {
        logger.error("Failed to disconnect from Redis:", error);
        throw error;
      }
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(
    key: string,
    value: string,
    ttlInSeconds: number = ttlInSecondsGlobal
  ): Promise<void> {
    try {
      await this.client.setEx(key, ttlInSeconds, value);
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  async lPush(key: string, ...values: string[]): Promise<number> {
    try {
      if (values.length === 0) {
        logger.warn(`No values provided for LPUSH on key ${key}`);
        return 0;
      }
      return await this.client.lPush(key, values);
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async brPop(
    key: string,
    timeout: number
  ): Promise<{ key: string; element: string } | null> {
    try {
      const result = await this.client.brPop(key, timeout);
      return result ? { key: result.key, element: result.element } : null;
    } catch (error) {
      logger.error(`Redis BRPOP error for key ${key}:`, error);
      throw error;
    }
  }

  async sAdd(key: string, value: string): Promise<number> {
    try {
      return await this.client.sAdd(key, value);
    } catch (error) {
      logger.error(`Redis SADD error for key ${key}:`, error);
      throw error;
    }
  }

  async sIsMember(key: string, value: string): Promise<boolean> {
    try {
      return await this.client.sIsMember(key, value);
    } catch (error) {
      logger.error(`Redis SISMEMBER error for key ${key}:`, error);
      throw error;
    }
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }
}

export const redisClient = new RedisClient();