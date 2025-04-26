import { Campaign, Keyword, sequelizeSystem } from "../../models/index.model";
import { DistributionType } from "../../enums/distribution.enum";
import { Op } from "sequelize";
import { ErrorType } from "../../types/Error.type";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import statusCode from "../../constants/statusCode";
import { keywordStatus } from "../../enums/keywordStatus.enum";

export const getKeywordListRepo = async (filters: {
  campaignId?: number;
  distribution?: DistributionType;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<{ keywords: KeywordAttributes[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.distribution) where.distribution = filters.distribution;
    if (filters.start_date || filters.end_date) {
      where.createdAt = {};
      if (filters.start_date) where.createdAt[Op.gte] = filters.start_date;
      if (filters.end_date) where.createdAt[Op.lte] = filters.end_date;
    }

    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
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

    const { rows: keywords, count: total } = await Keyword.findAndCountAll(
      queryOptions
    );

    return { keywords, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createKeywordRepo = async (data: {
  campaignId: number;
  name: string;
  urls: string[];
  traffic: number;
  status: string;
  distribution: DistributionType;
  cost: number;
}): Promise<any> => {
  try {
    const campaign = await Campaign.findByPk(data.campaignId);
    const keyword = await Keyword.create(data);
    return {
      keywordId: keyword.id,
      urls: keyword.urls,
      keyword: keyword.name,
      title: campaign?.title,
      traffic: keyword.traffic,
      distribution: keyword.distribution,
      cost: keyword.cost,
      device: campaign?.device,
      domain: campaign?.domain,
      timeStart: campaign?.startDate.toString(),
      timeEnd: campaign?.endDate.toString(),
      searchTool: campaign?.search,
    };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getKeywordByIdRepo = async (
  id: number
): Promise<KeywordAttributes | null> => {
  try {
    const keyword = await Keyword.findByPk(id);
    return keyword;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getKeywordsByDistributionType = async (
  startDate?: string, // Optional: filter keywords by createdAt
  endDate?: string // Optional: filter keywords by createdAt
): Promise<any> => {
  try {
    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    // Keyword filter
    const keywordWhere: any = { isDeleted: false };

    // Date range filter for keywords
    if (startDate || endDate) {
      keywordWhere[Op.and] = [];
      if (startDate) {
        keywordWhere[Op.and].push({ createdAt: { [Op.gte]: startDate } });
      }
      if (endDate) {
        keywordWhere[Op.and].push({ createdAt: { [Op.lte]: endDate } });
      }
    }

    const queryOptions: any = {
      where: keywordWhere,
      group: ["distribution"],
      attributes: [
        "distribution",
        [
          sequelizeSystem.fn("COUNT", sequelizeSystem.col("distribution")),
          "count",
        ],
      ],
      raw: true,
    };

    const result = await Keyword.findAll(queryOptions);

    return result.map((item: any) => ({
      distribution: item.distribution,
      count: item.count,
    }));
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getKeywordByCampaignIdRepo = async (
  id: number
): Promise<KeywordAttributes[] | null> => {
  try {
    // Validate campaign ID
    if (!Number.isInteger(id) || id <= 0) {
      throw {
        name: "ValidationError",
        message: "Campaign ID must be a positive integer",
      };
    }

    // Fetch keywords using Sequelize
    const keywords = await Keyword.findAll({
      where: { campaignId: id },
      attributes: ["distribution", "traffic", "urls", "name"],
    });

    // Return null if no keywords found
    return keywords.length > 0 ? keywords : null;
  } catch (error: unknown) {
    // Type-safe error handling
    const errorType: ErrorType = {
      name: "DatabaseError",
      message: "Failed to fetch keywords",
    };

    if (error instanceof Error) {
      errorType.name = error.name || "DatabaseError";
      errorType.message = error.message || "Failed to fetch keywords";
      errorType.code = "code" in error ? String(error.code) : undefined;
    }

    throw errorType;
  }
};

export const updateKeywordRepo = async (
  id: number,
  data: Partial<{
    name: string;
    urls: string[];
    distribution: DistributionType;
    isDeleted: boolean;
    status: keywordStatus;
  }>
): Promise<KeywordAttributes> => {
  try {
    const keyword = await Keyword.findByPk(id, {
      include: [{ model: Campaign, as: 'campaigns' }], // Assuming 'campaign' is the alias for the association
    });
    if (!keyword) {
      throw new ErrorType(
        "NotFoundError",
        `Keyword with id ${id} not found`,
        statusCode.NOT_FOUND
      );
    }

    // Create a new object with only defined values, excluding traffic and campaignId
    const updateData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && key !== "traffic" && key !== "campaignId") {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await keyword.update(updateData);
    return keyword;
  } catch (error: any) {
    throw new ErrorType(
      error.name,
      error.message,
      error.code || statusCode.INTERNAL_SERVER_ERROR
    );
  }
};
