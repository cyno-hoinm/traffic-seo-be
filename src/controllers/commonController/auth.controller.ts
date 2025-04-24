import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import {
  createUserRepo,
  findUserByEmailRepo,
  findUserByIdRepo,
  findUserByUsernameRepo,
  getUserPermissions,
  updateUserOneFieldRepo,
} from "../../repositories/commonRepo/user.repository";
import {
  blacklistToken,
  comparePassword,
  hashedPasswordString,
  isTokenBlacklisted,
  removeSensitivity,
  signToken,
} from "../../utils/utils";
import statusCode from "../../constants/statusCode";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { ttlInSecondsGlobal } from "../../constants/redis.constant";
import { getWalletByUserIdRepo } from "../../repositories/moneyRepo/wallet.repository";
import { UserAttributes } from "../../interfaces/User.interface";
import { queueEmail } from "../../services/sendMail.service";

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
    const isPasswordValid = await comparePassword(
      password,
      user.password?.toString() || ""
    );
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
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isDeleted: user.isDeleted,
          role: user.role, // Include role if needed
          token: token,
        },
      },
    });
    return;
  } catch (error: any) {
    // console.log(error);
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
    const wallet = await getWalletByUserIdRepo(userId);
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
        walletId: wallet?.id,
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

export const registerUser = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length < 3
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Username is required and must be at least 3 characters",
        error: "Invalid field",
      });
      return;
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Password is required and must be at least 6 characters",
        error: "Invalid field",
      });
      return;
    }

    if (!email || typeof email !== "string") {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid email is required",
        error: "Invalid field",
      });
      return;
    }
    // Check if user already exists
    const existingUserByEmail = await findUserByEmailRepo(email);
    if (existingUserByEmail) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "User creation failed",
        error: "Email already exists",
      });
      return;
    }

    const existingUserByUsername = await findUserByUsernameRepo(username);
    if (existingUserByUsername) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "User creation failed",
        error: "Username already exists",
      });
      return;
    }
    // Hash password
    const hashedPassword = await hashedPasswordString(password, 10);

    // Prepare user data with default roleId
    const userData: UserAttributes = {
      username,
      password: hashedPassword,
      email,
      roleId: 2,
      isDeleted: false,
    };

    // Create user using repository
    const user = await createUserRepo(userData);
    if (user) {
      await queueEmail(user.email, "Welcome to Cyno Traffic System", "<p>Minh Hội provip123</p>");
    }
    // Return success response (exclude password)
    res.status(statusCode.OK).json({
      status: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error registering user",
      error: error.message,
    });
    return;
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<null>>
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.data?.id;

    // Validate authentication
    if (!userId) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Authentication required",
        error: "Unauthorized",
      });
      return;
    }

    // Validate input
    if (
      !currentPassword ||
      typeof currentPassword !== "string" ||
      currentPassword.length < 6
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message:
          "Current password is required and must be at least 6 characters",
        error: "Invalid field",
      });
      return;
    }

    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "New password is required and must be at least 6 characters",
        error: "Invalid field",
      });
      return;
    }

    // Fetch user to verify current password
    const user = await findUserByIdRepo(userId);
    if (!user) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "Resource not found",
      });
      return;
    }
    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password ? user.password.toString() : ""
    );
    if (!isPasswordValid) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Incorrect current password",
        error: "Authentication failed",
      });
      return;
    }

    // Hash new password
    const hashedNewPassword = await hashedPasswordString(newPassword, 10);

    // Update password using repository
    await updateUserOneFieldRepo(userId, "password", hashedNewPassword);

    // Return success response
    res.status(statusCode.OK).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: error.message,
        error: "Invalid field",
      });
      return;
    }

    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};
