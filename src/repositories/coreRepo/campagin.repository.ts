import { Op, Transaction } from "sequelize";
import { CampaignStatus } from "../../enums/campaign.enum";
import {
  Campaign,
  Keyword,
  Link,
  sequelizeSystem,
  User,
} from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { CampaignTypeAttributes } from "../../interfaces/CampaignType.interface";
import CampaignType from "../../models/CampaignType.model";
import { CampaignAttributes } from "../../interfaces/Campaign.interface";
import { CampaignReportList } from "../../interfaces/CampaignReport.interface";
import { LinkStatus } from "../../enums/linkStatus.enum";
import { keywordStatus } from "../../enums/keywordStatus.enum";
import statusCode from "../../constants/statusCode";

export const getCampaignListRepo = async (filters: {
  key?: string;
  userId?: number;
  countryId?: number;
  campaignTypeId?: number;
  device?: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}): Promise<{ campaigns: CampaignAttributes[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };
    // Add search by key (name, domain, search)
    if (filters.key) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.key}%` } }, // Case-insensitive search for name
        { domain: { [Op.like]: `%${filters.key}%` } }, // Case-insensitive search for domain
        { search: { [Op.like]: `%${filters.key}%` } }, // Case-insensitive search for search
      ];
    }

    if (filters.userId) where.userId = filters.userId;
    if (filters.countryId) where.countryId = filters.countryId;
    if (filters.campaignTypeId) where.campaignTypeId = filters.campaignTypeId;
    if (filters.device) where.device = filters.device;
    if (filters.title) where.title = filters.title;
    if (filters.startDate) where.startDate = { [Op.gte]: filters.startDate };
    if (filters.endDate) where.endDate = { [Op.lte]: filters.endDate };
    if (filters.status) where.status = filters.status;

    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "users",
          attributes: ["username"], // Only fetch the username
        },
        {
          model: Link,
          as: "links",
          where: { isDeleted: false },
          required: false, // Include campaign even if no links
        },
        {
          model: Keyword,
          as: "keywords",
          where: { isDeleted: false },
          required: false, // Include campaign even if no keywords
        },
      ],
    };

    // Apply pagination only if page and limit are not 0
    if (
      filters.page &&
      filters.limit &&
      filters.page > 0 &&
      filters.limit > 0
    ) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: campaigns, count: total } = await Campaign.findAndCountAll(
      queryOptions
    );

    return { campaigns, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createCampaignRepo = async (
  data: {
    userId: number;
    countryId: number;
    name: string;
    device: string;
    title: string;
    startDate: Date;
    endDate: Date;
    domain: string;
    search: string;
    campaignTypeId: CampaignTypeAttributes;
    status: CampaignStatus;
    isDeleted: boolean;
  },
  transaction?: Transaction
): Promise<CampaignAttributes> => {
  try {
    const campaign = await Campaign.create(data, { transaction });
    return campaign;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getCampaignByIdRepo = async (
  id: number
): Promise<CampaignAttributes | null> => {
  try {
    const campaign = await Campaign.findByPk(id, {
      attributes: [
        "id",
        "title",
        "name",
        "startDate",
        "endDate",
        "domain",
        "userId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Link,
          as: "links",
          where: { isDeleted: false },
          required: false, // Include campaign even if no links
        },
        {
          model: Keyword,
          as: "keywords",
          where: { isDeleted: false },
          required: false, // Include campaign even if no keywords
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return campaign?.dataValues || null;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getCampaignReport = async (
  status?: CampaignStatus,
  startDate?: string,
  endDate?: string,
  userId?: number
): Promise<CampaignReportList[]> => {
  try {
    // Validate date formats if provided
    if (startDate) {
      throw new ErrorType("ValidationError", "Invalid start date format");
    }
    if (endDate) {
      throw new ErrorType("ValidationError", "Invalid end date format");
    }

    // Build where clause
    const where: any = { isDeleted: false };
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where[Op.and] = [];
      if (startDate) {
        where[Op.and].push({ startDate: { [Op.gte]: startDate } });
      }
      if (endDate) {
        where[Op.and].push({ endDate: { [Op.lte]: endDate } });
      }
    }

    if (!sequelizeSystem) {
      throw new ErrorType(
        "InitializationError",
        "Sequelize instance is not initialized"
      );
    }

    const results = await Campaign.findAll({
      where,
      include: [
        {
          model: CampaignType,
          as: "campaignTypes",
          attributes: ["name"],
          required: true, // Inner join to ensure only campaigns with valid campaign types are included
        },
      ],
      group: ["Campaign.campaignTypeId", "campaignTypes.name"],
      attributes: [
        "campaignTypeId",
        [
          sequelizeSystem.fn(
            "COUNT",
            sequelizeSystem.col("Campaign.campaignTypeId")
          ),
          "count",
        ],
      ],
      raw: true,
    });

    return results.map((item: any) => ({
      campaignTypeId: item.campaignTypeId,
      campaignTypeName: item["campaignTypes.name"],
      campaignTitle: item["campaignTypes.title"],
      count: parseInt(item.count, 10),
    }));
  } catch (error) {
    throw error instanceof ErrorType
      ? error
      : new ErrorType("UnknownError", "Failed to fetch campaign report");
  }
};

export const pauseCampaignRepo = async (
  id: number,
  transaction?: Transaction
): Promise<boolean> => {
  try {
    if (!sequelizeSystem) {
      throw new ErrorType(
        "InitializationError",
        "Sequelize instance is not initialized",
        statusCode.INTERNAL_SERVER_ERROR
      );
    }

    // Use provided transaction or create a new one
    const t = transaction || (await sequelizeSystem.transaction());

    try {
      // Find the campaign
      const campaign = await Campaign.findByPk(id, { transaction: t });

      if (!campaign) {
        throw new ErrorType(
          "NotFoundError",
          `Campaign with id ${id} not found`,
          statusCode.NOT_FOUND
        );
      }

      // Update campaign status to PAUSED and set endDate to now
      await campaign.update(
        {
          status: CampaignStatus.PAUSED,
        },
        { transaction: t }
      );

      // Update all associated keywords to INACTIVE
      await Keyword.update(
        { status: keywordStatus.INACTIVE },
        {
          where: {
            campaignId: id,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      // Update all associated links to INACTIVE
      await Link.update(
        { status: LinkStatus.INACTIVE },
        {
          where: {
            campaignId: id,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      // Commit the transaction if it was created here
      if (!transaction) {
        await t.commit();
      }

      return true;
    } catch (error) {
      // Rollback the transaction if it was created here and not yet committed
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  } catch (error: any) {
    throw error instanceof ErrorType
      ? error
      : new ErrorType(
          error.name,
          error.message,
          error.code || statusCode.INTERNAL_SERVER_ERROR
        );
  }
};
export const continueCampaignRepo = async (
  id: number,
  transaction?: Transaction
): Promise<boolean> => {
  try {
    if (!sequelizeSystem) {
      throw new ErrorType(
        "InitializationError",
        "Sequelize instance is not initialized",
        statusCode.INTERNAL_SERVER_ERROR
      );
    }

    // Use provided transaction or create a new one
    const t = transaction || (await sequelizeSystem.transaction());

    try {
      // Find the campaign
      const campaign = await Campaign.findByPk(id, { transaction: t });

      if (!campaign) {
        throw new ErrorType(
          "NotFoundError",
          `Campaign with id ${id} not found`,
          statusCode.NOT_FOUND
        );
      }

      // Update campaign status to ACTIVE
      await campaign.update(
        {
          status: CampaignStatus.ACTIVE,
        },
        { transaction: t }
      );

      // Update all associated keywords to ACTIVE
      await Keyword.update(
        { status: keywordStatus.ACTIVE },
        {
          where: {
            campaignId: id,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      // Update all associated links to ACTIVE
      await Link.update(
        { status: LinkStatus.ACTIVE },
        {
          where: {
            campaignId: id,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      // Commit the transaction if it was created here
      if (!transaction) {
        await t.commit();
      }

      return true;
    } catch (error) {
      // Rollback the transaction if it was created here and not yet committed
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  } catch (error: any) {
    throw error instanceof ErrorType
      ? error
      : new ErrorType(
          error.name,
          error.message,
          error.code || statusCode.INTERNAL_SERVER_ERROR
        );
  }
};

export const cancelCampaignRepo = async (
  id: number,
  transaction?: Transaction
): Promise<boolean> => {
  try {
    if (!sequelizeSystem) {
      throw new ErrorType(
        "InitializationError",
        "Sequelize instance is not initialized",
        statusCode.INTERNAL_SERVER_ERROR
      );
    }

    // Use provided transaction or create a new one
    const t = transaction || (await sequelizeSystem.transaction());

    try {
      // Find the campaign
      const campaign = await Campaign.findByPk(id, { transaction: t });

      if (!campaign) {
        throw new ErrorType(
          "NotFoundError",
          `Campaign with id ${id} not found`,
          statusCode.NOT_FOUND
        );
      }

      // Get current date and reset time to 00:00:00.000
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Get campaign startDate and reset time to 00:00:00.000
      const startDate = new Date(campaign.startDate);
      startDate.setHours(0, 0, 0, 0);

      // Prepare update data
      const updateData: { status: CampaignStatus; startDate?: Date; endDate: Date } = {
        status: CampaignStatus.CANCEL,
        endDate: new Date(), // Always set endDate to current date/time
      };

      // If startDate is before currentDate, set both startDate and endDate to current date
      if (startDate < currentDate) {
        updateData.startDate = new Date();
        updateData.endDate = new Date();
      }

      // Update campaign
      await campaign.update(updateData, { transaction: t });

      // Update all associated keywords to INACTIVE
      await Keyword.update(
        { status: keywordStatus.INACTIVE },
        {
          where: {
            campaignId: id,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      // Update all associated links to INACTIVE
      await Link.update(
        { status: LinkStatus.INACTIVE },
        {
          where: {
            campaignId: id,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      // Commit the transaction if it was created here
      if (!transaction) {
        await t.commit();
      }

      return true;
    } catch (error) {
      // Rollback the transaction if it was created here and not yet committed
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  } catch (error: any) {
    throw error instanceof ErrorType
      ? error
      : new ErrorType(
          error.name,
          error.message,
          error.code || statusCode.INTERNAL_SERVER_ERROR
        );
  }
};

export const isCampaignOwnerRepo = async (
  {
    campaignId, userId
  }
  :
  {
  campaignId: number,
  userId: number
}
): Promise<boolean> => {
  try {
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        isDeleted: false,
      },
      attributes: ["userId"],
    });

    if (!campaign) {
      throw new ErrorType(
        "NotFoundError",
        `Campaign with id ${campaignId} not found`,
        statusCode.NOT_FOUND
      );
    }

    return campaign.userId === userId;
  } catch (error: any) {
    throw error instanceof ErrorType
      ? error
      : new ErrorType(
          error.name,
          error.message,
          error.code || statusCode.INTERNAL_SERVER_ERROR
        );
  }
};
