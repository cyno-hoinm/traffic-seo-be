import { Op } from "sequelize";
import { UserAttributes } from "../interfaces/User.interface";
import { User, Role } from "../models/index.model";
import { ErrorType } from "../types/Error.type";

// Create a new user
export const createUserRepo = async (
  userData: Omit<UserAttributes, "id" | "createdAt" | "updatedAt">
): Promise<User> => {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Find a user by ID
export const findUserByIdRepo = async (id: number): Promise<User | null> => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Find a user by email
export const findUserByEmailRepo = async (
  email: string
): Promise<User | null> => {
  try {
    const user = await User.findOne({ where: { email } });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Find a user by username
export const findUserByUsernameRepo = async (
  username: string
): Promise<User | null> => {
  try {
    const user = await User.findOne({ where: { username } });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Find all users
export const findAllUsersRepo = async (): Promise<User[]> => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: "role" }],
    });
    return users;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Update a user by ID
export const updateUserRepo = async (
  id: number,
  userData: Partial<UserAttributes>
): Promise<User | null> => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }
    await user.update(userData);
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Update a single field of a user by field name and value
export const updateUserOneFieldRepo = async (
  id: number,
  fieldName: keyof UserAttributes,
  value: UserAttributes[keyof UserAttributes]
): Promise<User | null> => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }

    // Validate that the field exists in UserAttributes
    if (!(fieldName in user)) {
      throw new ErrorType(
        "ValidationError",
        `Field ${fieldName} does not exist on User`
      );
    }

    // Update the specific field
    await user.update({ [fieldName]: value });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
// Search users where both email and username contain the key with pagination
export const searchUserListRepo = async (
  key: string | undefined,
  pageSize: number,
  pageLimit: number
): Promise<{ users: User[]; total: number }> => {
  try {
    // Build the where clause for searching
    const where: any = {};

    if (key) {
      // Search for users where both email AND username contain the key
      where[Op.and] = [
        { email: { [Op.iLike]: `%${key}%` } }, // Case-insensitive search for email
        { username: { [Op.iLike]: `%${key}%` } }, // Case-insensitive search for username
      ];
    }

    // If pageSize or pageLimit is 0, fetch all matching users without pagination
    if (pageSize === 0 || pageLimit === 0) {
      const users = await User.findAll({ where });
      return { users, total: users.length };
    }

    // Calculate offset for pagination
    const offset = (pageSize - 1) * pageLimit;

    // Fetch users with pagination
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      limit: pageLimit,
      offset,
    });

    return { users, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
// Delete a user by ID
export const deleteUserRepo = async (id: number): Promise<boolean> => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return false;
    }
    await user.destroy();
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
