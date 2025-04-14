import { Campaign, Keyword, sequelizeSystem } from "../../models/index.model";
import { DistributionType } from "../../enums/distribution.enum";
import { Op } from "sequelize";
import { ErrorType } from "../../types/Error.type";

export const getKeywordListRepo = async (filters: {
  campaignId?: number;
  distribution?: DistributionType;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<{ keywords: Keyword[]; total: number }> => {
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
  url: string[];
  traffic: number;
  distribution: DistributionType;
}): Promise<Keyword> => {
  try {
    const keyword = await Keyword.create(data);
    return keyword;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getKeywordByIdRepo = async (
  id: number
): Promise<Keyword | null> => {
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
      group: ['distribution'],
      attributes: [
        'distribution',
        [sequelizeSystem.fn('COUNT', sequelizeSystem.col('distribution')), 'count'],
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