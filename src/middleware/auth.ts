import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/Jwt.type";
import { ResponseType } from "../types/Response.type";
import statusCode from "../constants/statusCode";
import { AuthenticatedRequest } from "../types/AuthenticateRequest.type";
import { findUserByIdRepo } from "../repositories/commonRepo/user.repository";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response<ResponseType<null>>,
  next: NextFunction
): void => {
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
    if (!req.data || !req.data.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized.",
      });
      return;
    }

    const userId = req.data.id;

    try {
      // Fetch user details, including their role and permissions
      const userDetails = await findUserByIdRepo(userId);
      if (!userDetails) {
        res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "User not found.",
        });
        return;
      }
      res.send(userDetails);
      // Fetch user's permissions (assuming userDetails includes role and rolePermissions)
      // const userPermissions = await getUserPermissions(userId); // Implement this function

      // Check if user has all required permissions
      // const hasPermission = requiredPermissions.every((perm) =>
      //   userPermissions.includes(perm)
      // );

      // if (!hasPermission) {
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
