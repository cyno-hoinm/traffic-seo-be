import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/Jwt.type";
import { ResponseType } from "../types/Response.type";
import statusCode from "../constants/statusCode";
import { AuthenticatedRequest } from "../types/AuthenticateRequest.type";
import { getUserPermissions } from "../repositories/commonRepo/user.repository";
import { isTokenBlacklisted } from "../utils/utils";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<null>>,
  next: NextFunction
): Promise<void> => {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    const response: ResponseType<null> = {
      status: false,
      message: "Unauthorized: No token provided",
    };
    res.status(statusCode.UNAUTHORIZED).json(response);
    return;
  }
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    res.status(statusCode.UNAUTHORIZED).json({
      status: false,
      message: "Token is blacklisted",
    });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.data = decoded;
    next();
  } catch (error: any) {
    let errorMessage = "Unauthorized: Invalid token";
    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = "Unauthorized: Token expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = "Unauthorized: Invalid token";
    }

    const response: ResponseType<null> = {
      status: false,
      message: errorMessage,
    };
    res.status(statusCode.UNAUTHORIZED).json(response);
    return;
  }
};

export const authorization =
  (requiredPermissions: string[]) =>
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Check if user data exists (set by authenticateToken middleware)
    // if (!req.data || !req.data.id) {
    //   res.status(statusCode.UNAUTHORIZED).json({
    //     status: false,
    //     message: "Unauthorized.",
    //   });
    //   return;
    // }

    // const userId = req.data.id;

    try {
      // // Fetch user details, including their role and permissions
      // const permissions = await getUserPermissions(userId);
      // if (!permissions) {
      //   res.status(statusCode.FORBIDDEN).json({
      //     status: false,
      //     message: "Forbidden.",
      //   });
      //   return;
      // }

      // // Check if user has all required permissions
      // const hasPermission = requiredPermissions.every((perm) =>
      //   permissions.includes(perm)
      // );

      // if (hasPermission) {
      //   res.status(statusCode.FORBIDDEN).json({
      //     status: false,
      //     message: "Insufficient permissions.",
      //   });
      //   return;
      // }

      next();
    } catch (error: any) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch user details.",
        details: error.message,
      });
    }
  };
