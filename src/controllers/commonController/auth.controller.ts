import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import {
  findUserByEmailRepo,
  getUserPermissions,
} from "../../repositories/commonRepo/user.repository";
import {
  blacklistToken,
  comparePassword,
  isTokenBlacklisted,
  removeSensitivity,
  signToken,
} from "../../utils/utils";
import statusCode from "../../constants/statusCode";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { ttlInSecondsGlobal } from "../../constants/redis.constant";

export const loginUser = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ status: false, message: "Email and password are required" });
      return;
    }

    // Fetch user with role using the repository
    const user = await findUserByEmailRepo(email);

    // Check if user exists
    if (!user) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Invalid email or password" });
      return;
    }

    // Verify password (assuming it's hashed in the database)
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Invalid email or password" });
      return;
    }

    const token = signToken(user.toJSON());

    res.status(statusCode.OK).json({
      status: true,
      message: "Login successful",
      data: {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isDeleted: user.isDeleted,
          role: user.role, // Include role if needed
        },
      },
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    // Check if user exists from authentication middleware
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }

    // Parse user ID safely
    const userId =
      typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
    if (isNaN(userId)) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Invalid user ID",
      });
      return;
    }

    // Fetch permissions
    const permissions = await getUserPermissions(userId);
    if (!permissions) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "Forbidden: No permissions found",
      });
      return;
    }
    // Return user data
    res.status(statusCode.OK).json({
      status: true,
      message: "User retrieved successfully",
      data: {
        ...user,
        permissions: permissions,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!token) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Access token is required",
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Token is blacklisted",
      });
      return;
    }
    // Blacklist the old token
    await blacklistToken(token, ttlInSecondsGlobal); // Use your global TTL (e.g., 15 minutes)
    const newInformationUser = removeSensitivity(user);
    const newToken = signToken(newInformationUser);

    // Return new token
    res.status(statusCode.OK).json({
      status: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
