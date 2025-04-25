import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.config";
import { AppError } from "../types/AppError.type";
import statusCode from "../constants/statusCode";
import { statusColors } from "../constants/statusCodeColor";
import { AuthenticatedRequest } from "../types/AuthenticateRequest.type";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || statusCode.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";
  const isDev = process.env.NODE_ENV === "development" || true;
  if (isDev) {
    logger.error(
      `${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production mode
    if (err.isOperational) {
      logger.error(`${err.status} - ${err.message}`);
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or unknown errors
      logger.error("ERROR 💥", err);
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
};

export const requestLogger = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Log incoming request
  logger.http(
    `${statusColors.info}➡️ Incoming ${method} ${url} from ${
      req.data?.email ? req.data.email : ""
    } - ${ip}${statusColors.reset}`
  );

  // // Safely log request body if present
  // if (req.body && Object.keys(req.body).length > 0) {
  //   logger.debug(`📦 Request Body: ${JSON.stringify(req.body, null, 2)}`);
  // }

  // Capture response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Choose color based on status code
    let statusColor = statusColors.success;
    if (status >= 500) statusColor = statusColors.error;
    else if (status >= 400) statusColor = statusColors.warn;

    logger.http(
      `${statusColor}⬅️ ${method} ${url} ${status} ${duration}ms - ${
        req.data?.email ? req.data.email : ""
      } - ${ip}${statusColors.reset}`
    );
  });

  next();
};
