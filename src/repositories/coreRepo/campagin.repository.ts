import { Op } from "sequelize";
import { UserAttributes } from "../../interfaces/User.interface";
import { CampaignStatus } from "../../enums/campaign.enum";
import { User, Role, Campaign } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { CampaignTypeAttributes } from "../../interfaces/CampaignType.interface";

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

export const findUserByIdRepo = async (id: number): Promise<User | null> => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["roleId", "password"] },
      include: [{ model: Role, as: "role" }],
      order: [["createdAt", "DESC"]],
    });
    return user;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const findUserByEmailRepo = async (
  email: string
): Promise<User | null> => {
  try {
    const user = await User.findOne({
      where: { email, isDeleted: false },
      attributes: { exclude: ["roleId"] },
      include: [{ model: Role, as: "role" }],
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

export const findAllUsersRepo = async (): Promise<User[]> => {
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
): Promise<User | null> => {
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
  pageSize: number,
  pageLimit: number
): Promise<{ users: User[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };
    if (key) {
      where[Op.and] = [
        { email: { [Op.iLike]: `%${key}%` } },
        { username: { [Op.iLike]: `%${key}%` } },
      ];
    }
    if (pageSize === 0 || pageLimit === 0) {
      const users = await User.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });
      return { users, total: users.length };
    }
    const offset = (pageSize - 1) * pageLimit;
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      limit: pageLimit,
      offset,
      attributes: { exclude: ["roleId", "password"] },
      include: [{ model: Role, as: "role" }],
      order: [["createdAt", "DESC"]],
    });
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

export const getCampaignListRepo = async (filters: {
  userId?: number;
  countryId?: number;
  type?: string;
  device?: string;
  timeCode?: string;
  startDate?: Date;
  endDate?: Date;
  status?: CampaignStatus;
}): Promise<Campaign[]> => {
  try {
    const where: any = { isDeleted: false };
    if (filters.userId) where.userId = filters.userId;
    if (filters.countryId) where.countryId = filters.countryId;
    if (filters.type) where.type = filters.type;
    if (filters.device) where.device = filters.device;
    if (filters.timeCode) where.timeCode = filters.timeCode;
    if (filters.startDate) where.startDate = { [Op.gte]: filters.startDate };
    if (filters.endDate) where.endDate = { [Op.lte]: filters.endDate };
    if (filters.status) where.status = filters.status;
    const campaigns = await Campaign.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    return campaigns;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createCampaignRepo = async (data: {
  userId: number;
  countryId: number;
  name: string;
  type: string;
  device: string;
  timeCode: string;
  startDate: Date;
  endDate: Date;
  totalTraffic: number;
  cost: number;
  domain: string;
  search: string;
  campaignTypeId: CampaignTypeAttributes;
  keyword: string;
  status: CampaignStatus;
}): Promise<Campaign> => {
  try {
    const campaign = await Campaign.create(data);
    return campaign;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getCampaignByIdRepo = async (
  id: number
): Promise<Campaign | null> => {
  try {
    const campaign = await Campaign.findByPk(id, {
      order: [["createdAt", "DESC"]],
    });
    return campaign;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
