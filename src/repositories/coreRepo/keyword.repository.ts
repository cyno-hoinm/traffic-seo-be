import { Keyword } from "../../models/index.model";
import { DistributionType } from "../../enums/distribution.enum";
import { Op } from "sequelize";
import { ErrorType } from "../../types/Error.type";

export const getKeywordListRepo = async (filters: {
  campaignId?: number;
  distribution?: DistributionType;
  start_date?: Date;
  end_date?: Date;
}): Promise<Keyword[]> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.distribution) where.distribution = filters.distribution;
    if (filters.start_date || filters.end_date) {
      where.createdAt = {};
      if (filters.start_date) where.createdAt[Op.gte] = filters.start_date;
      if (filters.end_date) where.createdAt[Op.lte] = filters.end_date;
    }

    const keywords = await Keyword.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    return keywords;
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
