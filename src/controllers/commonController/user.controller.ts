import { hashedPasswordString } from "../../utils/utils";
import { Request, Response } from "express";
import { Buffer } from "buffer";
import {
  createUserRepo,
  findUserByIdRepo,
  findUserByEmailRepo,
  findUserByUsernameRepo,
  findAllUsersRepo,
  updateUserRepo,
  updateUserOneFieldRepo,
  searchUserListRepo,
  deleteUserRepo,
} from "../../repositories/commonRepo/user.repository";
import { UserAttributes } from "../../interfaces/User.interface";
import statusCode from "../../constants/statusCode";
import { ResponseType } from "../../types/Response.type";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { ImageType } from "../../enums/imageType.enum";
import { createNewImage } from "../../repositories/commonRepo/image.repository";
import { uuidToNumber, uuIDv4 } from "../../utils/generate";
import Image from "../../models/Image.model";

// Create a new user
export const createUser = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { username, password, email, roleId, phoneNumber } = req.body;

    // Validate input
    if (!username || !password || !email) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: "All fields (username, password, email) are required",
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

    const hashedPassword = await hashedPasswordString(password, 10);
    const userData: UserAttributes = {
      username,
      phoneNumber,
      password: hashedPassword,
      email,
      roleId,
      isDeleted: false,
    };
    const newUser = await createUserRepo(userData);

    res.status(statusCode.CREATED).json({
      status: true,
      message: "User created successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        roleId: newUser.roleId,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
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

// Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid user ID",
      });
      return;
    }

    const user = await findUserByIdRepo(userId);

    if (!user) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "User not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const users = await findAllUsersRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a user by ID
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, email, roleId, phoneNumber } = req.body;
    const userId = parseInt(id, 10);
    if (req.data?.id != userId) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You are not authorized to access this resource",
        error: "Forbidden",
      });
      return;
    }
    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid user ID",
      });
      return;
    }

    if (!username && !password && !email && !roleId) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error:
          "At least one field (username, password, email, roleId) is required to update",
      });
      return;
    }

    const userData: Partial<UserAttributes> = {};
    if (username) userData.username = username;
    if (password) userData.password = await hashedPasswordString(password, 10);
    if (email) userData.email = email;
    if (roleId) userData.roleId = roleId;
    if (phoneNumber) userData.phoneNumber = phoneNumber;

    const updatedUser = await updateUserRepo(userId, userData);

    if (!updatedUser) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "User not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "User updated successfully",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
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

// Update a single field of a user
export const updateUserOneField = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { fieldName, value } = req.body;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid user ID",
      });
      return;
    }

    if (!fieldName || value === undefined) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: "Both fieldName and value are required",
      });
      return;
    }

    const validFields: (keyof UserAttributes)[] = [
      "username",
      "password",
      "email",
      "roleId",
      "phoneNumber",
    ];
    if (!validFields.includes(fieldName)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Validation failed",
        error: `Invalid fieldName. Must be one of: ${validFields.join(", ")}`,
      });
      return;
    }

    const updatedUser = await updateUserOneFieldRepo(userId, fieldName, value);

    if (!updatedUser) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "User not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: `User ${fieldName} updated successfully`,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
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

// Search users with pagination
export const searchUserList = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { key, page, limit } = req.body;

    const pageSizeNum = parseInt(page as string, 10);
    const pageLimitNum = parseInt(limit as string, 10);

    if (isNaN(pageSizeNum) || pageSizeNum < 0) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "pageSize must be a non-negative integer",
      });
      return;
    }
    if (isNaN(pageLimitNum) || pageLimitNum < 0) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "pageLimit must be a non-negative integer",
      });
      return;
    }

    const { users, total } = await searchUserListRepo(
      key as string | undefined,
      pageSizeNum,
      pageLimitNum
    );

    if (pageSizeNum === 0 || pageLimitNum === 0) {
      res.status(statusCode.OK).json({
        status: true,
        message: "Users retrieved successfully",
        data: {
          total: total,
          list: users,
        },
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Users retrieved successfully",
      pageSize: pageSizeNum,
      pageLimit: pageLimitNum,
      totalPages: Math.ceil(total / pageLimitNum),
      data: {
        total: total,
        list: users,
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

// Delete a user by ID
export const deleteUser = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid user ID",
      });
      return;
    }

    const deleted = await deleteUserRepo(userId);

    if (!deleted) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "User not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const uploadUserImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "No image file provided",
        error: "Missing field",
      });
      return;
    }

    // Convert buffer to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const newImage = await createNewImage({
      id: uuidToNumber(uuIDv4()),
      imageBase64: base64Image,
      type: ImageType.USER,
    });
    // Update user with new image
    const updatedUser = await updateUserRepo(Number(id), {
      imageId: newImage.id,
    });

    if (!updatedUser) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "User not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "User image uploaded successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error uploading user image",
      error: error.message,
    });
  }
};

export const getUserImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const record = await Image.findOne({ where: { id: req.params.id } });

    if (!record || !record.imageBase64) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Image not found",
        error: "Image not found",
      });
      return;
    }

    // Extract base64 string from data URI
    const base64Match = record.imageBase64.match(/^data:image\/[a-z]+;base64,(.+)$/);
    if (!base64Match) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid image format",
        error: "Invalid base64 data",
      });
      return;
    }

    const base64Data = base64Match[1]; // Get the base64-encoded part
    const mimeType = record.imageBase64.split(";")[0].split(":")[1]; // e.g., "image/png"
    // Convert base64 to buffer
    const imgBuffer = Buffer.from(base64Data, "base64");

    // Set correct Content-Type and send image
    res.set("Content-Type", mimeType);
    res.send(imgBuffer);
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};