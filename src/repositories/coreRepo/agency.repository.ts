import { Agency, User } from "../../models/index.model";
import { AgencyAttributes } from "../../interfaces/Agency.interface";
import { Op, WhereOptions } from "sequelize";
import { ErrorType } from "../../types/Error.type";
import statusCode from "../../constants/statusCode";

export const createAgencyRepo = async (
  agencyData: Omit<AgencyAttributes, "id" | "createdAt" | "updatedAt">
): Promise<AgencyAttributes> => {
  try {
    // Check if agency already exists by name (or other unique field)
    const existingAgency = await Agency.findOne({
      where: { userId: agencyData.userId }, // Adjust 'name' to your unique field
    });

    if (existingAgency) {
      throw new ErrorType(
        "ConflictError", // Error name
        `Agency already exists`, // Message
        undefined, // Optional code (not used here)
        statusCode.CONFLICT // HTTP status code for Conflict
      );
    }

    // Create new agency
    const agency = await Agency.create(agencyData);
    return agency.toJSON() as AgencyAttributes;
  } catch (error) {
    if (error instanceof ErrorType) {
      throw error; // Re-throw ErrorType as-is
    }
    throw new Error(`Error creating agency: ${(error as Error).message}`);
  }
};

export const findAgencyByIdRepo = async (
  id: number
): Promise<AgencyAttributes | null> => {
  try {
    const agency = await Agency.findByPk(id);
    return agency ? (agency.toJSON() as AgencyAttributes) : null;
  } catch (error) {
    throw new Error(
      `Error finding agency by ID: ${(error as Error).message}`
    );
  }
};

export const findAllAgenciesRepo = async (): Promise<
  AgencyAttributes[]
> => {
  try {
    const agencies = await Agency.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return agencies.map(
      (agency) => agency.toJSON() as AgencyAttributes
    );
  } catch (error) {
    throw new Error(
      `Error finding all agencies: ${(error as Error).message}`
    );
  }
};

export const updateAgencyRepo = async (
  id: number,
  agencyData: Partial<
    Omit<AgencyAttributes, "id" | "createdAt" | "updatedAt">
  >
): Promise<AgencyAttributes | null> => {
  try {
    const agency = await Agency.findByPk(id);
    if (!agency) return null;

    await agency.update(agencyData);
    return agency.toJSON() as AgencyAttributes;
  } catch (error) {
    throw new Error(`Error updating agency: ${(error as Error).message}`);
  }
};

export const deleteAgencyRepo = async (id: number): Promise<boolean> => {
  try {
    const agency = await Agency.findByPk(id);
    if (!agency) return false;

    await agency.update({ isDeleted: true });
    return true;
  } catch (error) {
    throw new Error(`Error deleting agency: ${(error as Error).message}`);
  }
};

export const searchAgencyRepo = async (
  key: string | undefined,
  page: number,
  limit: number

): Promise<{ agencies: AgencyAttributes[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;

    // Build where clause for search
    const where: WhereOptions<Agency> = {
      isDeleted: false,
    };

    if (key) {
      where.inviteCode = {
        [Op.like]: `%${key}%`, // Case-insensitive search
      };
    }

    // Query roles with pagination and search
    const { rows: agencies, count: total } =
      await Agency.findAndCountAll({
        where,
        limit: limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

    return {
      agencies,
      total,
    };
  } catch (error) {
    throw new Error(`Error searching roles: ${(error as Error).message}`);
  }
};


export const getAgenciesByUserIdRepo = async (userId: number): Promise<AgencyAttributes[] | null> => {
  try {
    const agencies = await Agency.findAll({
      include: [
        {
          model: User,
          as: "user",
          where: {
            isDeleted: false // Only include non-deleted role agencies
          },
          attributes: [], // Exclude RoleAgency attributes from the result
          required: true, // Inner join to only return agencies with matching roleId
        },
      ],
      where: {
        userId,
        isDeleted: false, // Only include non-deleted agencies
      },
    });

    return agencies.length > 0 ? agencies : null;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const checkInviteCodeExistsRepo = async (
  inviteCode: string
): Promise<boolean> => {
  try {
    const agency = await Agency.findOne({
      where: {
        inviteCode,
        isDeleted: false,
      },
    });

    return !!agency; // Trả về true nếu có agency, ngược lại false
  } catch (error) {
    throw new Error(`Error checking invite code: ${(error as Error).message}`);
  }
};

export const getAgencyByInviteCodeRepo = async (
  inviteCode: string
): Promise<AgencyAttributes | null> => {
  try {
    const agency = await Agency.findOne({
      where: {
        inviteCode, // Tìm kiếm theo inviteCode
        isDeleted: false, // Chỉ lấy agency chưa bị xóa
      },
    });

    return agency ? (agency.toJSON() as AgencyAttributes) : null;
  } catch (error) {
    throw new Error(`Error finding agency by invite code: ${(error as Error).message}`);
  }
};
