import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import {
  createUserRepo,
  findUserByEmailForConfirmRepo,
  findUserByEmailRepo,
  findUserByIdRepo,
  getUserPermissions,
  updateUserOneFieldRepo,
} from "../../repositories/commonRepo/user.repository";
import {
  blacklistToken,
  comparePassword,
  hashedPasswordString,
  isTokenBlacklisted,
  removeSensitivity,
  saveOtpToRedis,
  signToken,
  verifyToken,
} from "../../utils/utils";
import statusCode from "../../constants/statusCode";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { ttlInSecondsGlobal } from "../../constants/redis.constant";
import { getWalletByUserIdRepo } from "../../repositories/moneyRepo/wallet.repository";
import { UserAttributes } from "../../interfaces/User.interface";
import { queueEmail } from "../../services/sendMail.service";
import { redisClient } from "../../config/redis.config";
import { generateOtp } from "../../utils/generate";
import { checkInviteCodeExistsRepo, getAgencyByInviteCodeRepo } from "../../repositories/coreRepo/agency.repository";

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
    if (user?.isActive === false) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "The account do not verify yet",
      });
      return;
    }
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
          userImage : `${process.env.DEV_URL}/api/auth/image/${user.imageId}`,
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
    const { username, password, email, inviteCode } = req.body;
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
    let invitedBy = undefined
    if (inviteCode) {
      const exist = await checkInviteCodeExistsRepo(inviteCode)
      if (!exist) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid invite code",
          error: "Invalid invite code",
        });
        return;
      }
      else {
        const agency = await getAgencyByInviteCodeRepo(inviteCode)
        invitedBy = agency?.id
      }
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

    // const existingUserByUsername = await findUserByUsernameRepo(username);
    // if (existingUserByUsername) {
    //   res.status(statusCode.BAD_REQUEST).json({
    //     status: false,
    //     message: "User creation failed",
    //     error: "Username already exists",
    //   });
    //   return;
    // }

    // Hash password
    const hashedPassword = await hashedPasswordString(password, 10);

    // Prepare user data with default roleId
    const userData: UserAttributes = {
      username,
      password: hashedPassword,
      phoneNumber: "",
      email,
      roleId: 2,
      invitedBy:invitedBy,
      isDeleted: false,
      isActive: false,
    };

    // Create user using repository
    const user = await createUserRepo(userData);
    const type = "confirmUser";
    // Generate OTP
    const otp = generateOtp(); // Assuming you have a generateOTP function
    const dataToken: dataToken = {
      email: user.email,
      otp: otp,
      type: type,
    };
    const token = signToken(dataToken);

    // Store OTP in Redis with 5-minute expiration
    await saveOtpToRedis(user.email, otp, type);

    // Send OTP email
    const emailContent = `
    <h1>Welcome to Cyno Traffic System</h1>
    <p>Your OTP for email verification is: <strong>${otp}</strong></p>
    <p>Please confirm at <a href="${process.env.FRONT_END_URL}/en/verify-email/${token}">Verify Email</a></p>
    <p>Please use this code to verify your email address.</p>
  `;

    await queueEmail(
      user.email,
      "Verify Your Email - Cyno Traffic System",
      emailContent
    );

    // Return success response (exclude password)
    res.status(statusCode.OK).json({
      status: true,
      message:
        "User registered successfully. Please verify your email with the OTP sent.",
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

export const confirmUser = async (
  req: Request,
  res: Response<ResponseType<UserAttributes | null>>
): Promise<void> => {
  try {
    const { email, otp, password, type, token } = req.body;

    // Validate input: either token or (email, otp, type) must be provided
    if (!token && (!email || !otp || !type)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Either token or email, otp, and type must be provided",
        error: "Invalid input",
      });
      return;
    }

    let dataFromToken: dataToken = { email: "", type: "", otp: "" };
    let finalEmail = email;
    let finalOtp = otp;
    let finalType = type;

    // Handle token-based verification
    if (token) {
      try {
        dataFromToken = verifyToken(token);
        finalEmail = dataFromToken.email;
        finalOtp = dataFromToken.otp;
        finalType = dataFromToken.type;
      } catch (tokenError: any) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: false,
          message: "Invalid or expired token",
          error: tokenError.message,
        });
        return;
      }
    }

    // Validate required fields
    if (!finalEmail || !finalOtp || !finalType) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Email, OTP, and type are required",
        error: "Invalid input",
      });
      return;
    }

    // Validate password if provided
    if (password !== null && password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Password must be a string with at least 6 characters",
          error: "Invalid field",
        });
        return;
      }
    }

    // Fetch user by email
    const user = await findUserByEmailForConfirmRepo(finalEmail);
    if (!user) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "Resource not found",
      });
      return;
    }

    // Verify OTP from Redis
    const storedOtp = await redisClient.get(`${finalType}:otp:${finalEmail}`);
    if (!storedOtp || storedOtp !== finalOtp) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Invalid or expired OTP",
        error: "Authentication failed",
      });
      return;
    }

    // Update isActive to true
    const finalUser = await updateUserOneFieldRepo(user.id, "isActive", true);
    // Update password if provided
    if (password) {
      const hashedNewPassword = await hashedPasswordString(password, 10);
      await updateUserOneFieldRepo(user.id, "password", hashedNewPassword);

    }

    // Delete OTP from Redis after successful verification
    await redisClient.del(`${finalType}:otp:${finalEmail}`);

    // Return success response
    res.status(statusCode.OK).json({
      status: true,
      message: "Email verified successfully",
      data: finalUser ? finalUser : null,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

export const resendOtp = async (
  req: Request,
  res: Response<ResponseType<null>>
): Promise<void> => {
  try {
    const { email, type, tokenFromReq } = req.body;

    // Validate input: either tokenFromReq or (email and type) must be provided
    if (!tokenFromReq && (!email || !type)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Either token or email and type must be provided",
        error: "Invalid input",
      });
      return;
    }

    let finalEmail: string;
    let finalType: string;

    // Handle token-based input
    if (tokenFromReq) {
      try {
        const dataParseFromToken = verifyToken(tokenFromReq) as dataToken;
        if (!dataParseFromToken.email || !dataParseFromToken.type) {
          res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid token: missing email or type",
            error: "Invalid token",
          });
          return;
        }
        finalEmail = dataParseFromToken.email;
        finalType = dataParseFromToken.type;
      } catch (tokenError: any) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: false,
          message: "Invalid or expired token",
          error: tokenError.message,
        });
        return;
      }
    } else {
      // Validate email and type directly from req.body
      if (typeof email !== "string" || typeof type !== "string") {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Email and type must be strings",
          error: "Invalid input",
        });
        return;
      }
      finalEmail = email;
      finalType = type;
    }

    // Fetch user by email
    const user = await findUserByEmailForConfirmRepo(finalEmail);
    if (!user) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "Resource not found",
      });
      return;
    }

    // Generate new OTP
    const otp = generateOtp();
    let token: string | undefined;

    // Generate token for confirmUser type
    if (finalType === "confirmUser") {
      const dataToken: dataToken = {
        email: user.email,
        otp,
        type: finalType,
      };
      token = signToken(dataToken);
    }

    // Store OTP in Redis with 5-minute expiration
    await saveOtpToRedis(user.email, otp, finalType);

    // Send OTP email
    const emailContent = `
      <h1>Welcome to Cyno Traffic System</h1>
      <p>Your OTP for email verification is: <strong>${otp}</strong></p>
      ${
        finalType === "confirmUser"
          ? `<p>Please confirm at <a href="${process.env.FRONT_END_URL}/en/verify-email/${encodeURIComponent(
              user.email
            )}">Verify Email</a></p>`
          : ""
      }
      <p>Please use this code to verify your email address.</p>
    `;

    await queueEmail(
      user.email,
      "Verify Your Email - Cyno Traffic System",
      emailContent
    );

    // Return success response
    res.status(statusCode.OK).json({
      status: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error resending OTP",
      error: error.message,
    });
  }
};
export interface dataToken {
  email: string;
  type: string;
  otp: string;
}
