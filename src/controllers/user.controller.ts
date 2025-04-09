import { hashedPasswordString } from "./../utils/utils";
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
} from "../repositories/user.repository";
import { UserAttributes } from "../interfaces/User.interface";
import statusCode from "../constants/statusCode";

// Create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, email, roleId } = req.body;

    // Validate input
    if (!username || !password || !email || !roleId) {
      res.status(statusCode.BAD_REQUEST).json({
        error: "All fields (username, password, email, roleId) are required",
      });
      return;
    }

    // Check if user already exists
    const existingUserByEmail = await findUserByEmailRepo(email);
    if (existingUserByEmail) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ error: "Email already exists" });
      return;
    }

    const existingUserByUsername = await findUserByUsernameRepo(username);
    if (existingUserByUsername) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ error: "Username already exists" });
      return;
    }
    const hashedPassword = await hashedPasswordString(password, 10);
    // Create the user
    const userData: Omit<UserAttributes, "id" | "createdAt" | "updatedAt"> = {
      username,
      password: hashedPassword, // Assuming password is already hashed
      email,
      roleId,
    };
    const newUser = await createUserRepo(userData);

    res.status(statusCode.CREATED).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roleId: newUser.roleId,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

// Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({ error: "Invalid user ID" });
      return;
    }
    const user = await findUserByIdRepo(userId);

    if (!user) {
      res.status(statusCode.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    res.status(statusCode.OK).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await findAllUsersRepo();
    res.status(statusCode.OK).json(
      users.map((user: UserAttributes) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))
    );
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

// Update a user by ID
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, email, roleId } = req.body;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({ error: "Invalid user ID" });
      return;
    }

    // Validate input
    if (!username && !password && !email && !roleId) {
      res.status(statusCode.BAD_REQUEST).json({
        error:
          "At least one field (username, password, email, roleId) is required to update",
      });
      return;
    }

    // Update the user
    const userData: Partial<UserAttributes> = {};
    if (username) userData.username = username;
    if (password) userData.password = password; // Assuming password is already hashed
    if (email) userData.email = email;
    if (roleId) userData.roleId = roleId;

    const updatedUser = await updateUserRepo(userId, userData);

    if (!updatedUser) {
      res.status(statusCode.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    res.status(statusCode.OK).json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

// Update a single field of a user by field name and value
export const updateUserOneField = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { fieldName, value } = req.body;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({ error: "Invalid user ID" });
      return;
    }

    // Validate input
    if (!fieldName || value === undefined) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ error: "Both fieldName and value are required" });
      return;
    }

    // Validate fieldName
    const validFields: (keyof UserAttributes)[] = [
      "username",
      "password",
      "email",
      "roleId",
    ];
    if (!validFields.includes(fieldName)) {
      res.status(statusCode.BAD_REQUEST).json({
        error: `Invalid fieldName. Must be one of: ${validFields.join(", ")}`,
      });
      return;
    }

    const updatedUser = await updateUserOneFieldRepo(userId, fieldName, value);

    if (!updatedUser) {
      res.status(statusCode.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    res.status(statusCode.OK).json({
      message: `User ${fieldName} updated successfully`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

// Search users where both email and username contain the key with pagination
export const searchUserList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { key, pageSize, pageLimit } = req.query;

    // Validate pagination parameters
    const pageSizeNum = parseInt(pageSize as string, 10);
    const pageLimitNum = parseInt(pageLimit as string, 10);

    if (isNaN(pageSizeNum) || pageSizeNum < 0) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ error: "pageSize must be a non-negative integer" });
      return;
    }
    if (isNaN(pageLimitNum) || pageLimitNum < 0) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ error: "pageLimit must be a non-negative integer" });
      return;
    }

    const { users, total } = await searchUserListRepo(
      key as string | undefined,
      pageSizeNum,
      pageLimitNum
    );

    // If pageSize or pageLimit is 0, pagination is disabled, so we don't include pagination metadata
    if (pageSizeNum === 0 || pageLimitNum === 0) {
      res.status(statusCode.OK).json({
        users: users.map((user: UserAttributes) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          roleId: user.roleId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        total,
      });
      return;
    }

    res.status(statusCode.OK).json({
      users: users.map((user: UserAttributes) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total,
      pageSize: pageSizeNum,
      pageLimit: pageLimitNum,
      totalPages: Math.ceil(total / pageLimitNum),
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};

// Delete a user by ID
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(statusCode.BAD_REQUEST).json({ error: "Invalid user ID" });
      return;
    }

    const deleted = await deleteUserRepo(userId);

    if (!deleted) {
      res.status(statusCode.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    res.status(statusCode.OK).json({ message: "User deleted successfully" });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: error.message });
    return;
  }
};
