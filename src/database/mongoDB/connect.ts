import mongoose from "mongoose";
import { connectTimeoutMS, maxPoolSize, minPoolSize, socketTimeoutMS } from "../../config/database.config";
import { ErrorType } from "../../types/Error.type";
import statusCode from "../../constants/statusCode";
import { logger } from "../../config/logger.config";
import e from "express";


let connection: typeof mongoose | null = null;

export const connectMongoDB = async (): Promise<typeof mongoose | null> => {
  try {
    connection = await mongoose.connect(process.env.MONGO_URL as string, {
      maxPoolSize: maxPoolSize, 
      minPoolSize: minPoolSize, 
      connectTimeoutMS: connectTimeoutMS,
      socketTimeoutMS: socketTimeoutMS,
      autoIndex: process.env.NODE_ENV !== "production",
    });
    logger.info("MongoDB connected successfully");
    return connection;
  } catch (error: any) {
    console.log(error);
    throw new ErrorType(
      error.name,
      error.message,
      error.code,
      statusCode.INTERNAL_SERVER_ERROR,
      { originalError: error }
    );
  }
};

export const getMongoConnection = (): typeof mongoose | null => connection;
export const disconnectMongoDB = async (): Promise<void> => {
  if (connection) {
    await connection.disconnect();
    connection = null;
  }
};
