import { Op } from "sequelize";
import { UserAttributes } from "../../interfaces/User.interface";
import {
  User,
  Role,
  RolePermission,
  Permission,
} from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

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

export const findUserByIdRepo = async (
  id: number
): Promise<UserAttributes | null> => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["roleId", "password"] },
      include: [
        {
          model: Role,
          as: "role",
          include: [
            {
              model: RolePermission,
              as: "rolePermissions",
              include: [
                {
                  model: Permission,
                  as: "permission",
                  attributes: ["name","code"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Helper function to extract permission names
export const getUserPermissions = async (userId: number): Promise<string[]> => {
  const user = await findUserByIdRepo(userId);
  if (!user || !user.role || !user.role.rolePermissions) return [];

  const permissions = user.role.rolePermissions
    .map((rp: any) => rp.permission?.code)
    .filter((code: string | undefined) => code); // Filter out undefined/null values
    console.log(permissions);
  return permissions;
};

export const findUserByEmailRepo = async (
  email: string
): Promise<User | null> => {
  try {
    const user = await User.findOne({
      where: { email, isDeleted: false },
      attributes: { exclude: ["roleId"] }, // Exclude password and roleId
      include: [
        {
          model: Role,
          as: "role",
          attributes: { exclude: ["createdAt", "updatedAt"] }, // Exclude role.createdAt and role.updatedAt
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const findUserByUsernameRepo = async (
  username: string
): Promise<User | null> => {
  try {
    const user = await User.findOne({
      where: { username, isDeleted: false },
      attributes: { exclude: ["roleId"] },
      include: [{ model: Role, as: "role" }],
      order: [["createdAt", "DESC"]],
    });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const findAllUsersRepo = async (): Promise<UserAttributes[]> => {
  try {
    const users = await User.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ["roleId", "password"] },
      include: [{ model: Role, as: "role" }],
      order: [["createdAt", "DESC"]],
    });
    return users;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

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

export const updateUserOneFieldRepo = async (
  id: number,
  fieldName: keyof UserAttributes,
  value: UserAttributes[keyof UserAttributes]
): Promise<UserAttributes | null> => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }
    if (!(fieldName in user)) {
      throw new ErrorType(
        "ValidationError",
        `Field ${fieldName} does not exist on User`
      );
    }
    await user.update({ [fieldName]: value });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const searchUserListRepo = async (
  key: string | undefined,
  page?: number,
  limit?: number
): Promise<{ users: UserAttributes[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };
    if (key) {
      where[Op.and] = [
        { email: { [Op.iLike]: `%${key}%` } },
        { username: { [Op.iLike]: `%${key}%` } },
      ];
    }

    const queryOptions: any = {
      where,
      attributes: { exclude: ["roleId", "password"] },
      include: [{ model: Role, as: "role" }],
      order: [["createdAt", "DESC"]],
    };

    // Apply pagination only if page and limit are not 0
    if (page && limit && page > 0 && limit > 0) {
      queryOptions.offset = (page - 1) * limit;
      queryOptions.limit = limit;
    }

    const { rows: users, count: total } = await User.findAndCountAll(
      queryOptions
    );

    return { users, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const deleteUserRepo = async (id: number): Promise<boolean> => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return false;
    }
    await user.update({ isDeleted: true });
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
