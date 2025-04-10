import { hashedPasswordString } from "../../utils/utils";
import { Request, Response } from "express";
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

// Create a new user
export const createUser = async (
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { username, password, email, roleId } = req.body;

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
    const userData: Omit<UserAttributes, "id" | "createdAt" | "updatedAt"> = {
      username,
      password: hashedPassword,
      email,
      roleId,
    };
    const newUser = await createUserRepo(userData);

    res.status(statusCode.CREATED).json({
      status: true,
      message: "User created successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
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
  req: Request,
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, email, roleId } = req.body;
    const userId = parseInt(id, 10);

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
    if (password) userData.password = password;
    if (email) userData.email = email;
    if (roleId) userData.roleId = roleId;

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
  res: Response<ResponseType<UserAttributes>>
): Promise<void> => {
  try {
    const { key, pageSize, pageLimit } = req.query;

    const pageSizeNum = parseInt(pageSize as string, 10);
    const pageLimitNum = parseInt(pageLimit as string, 10);

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
        total,
        data: users,
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Users retrieved successfully",
      total,
      pageSize: pageSizeNum,
      pageLimit: pageLimitNum,
      totalPages: Math.ceil(total / pageLimitNum),
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
