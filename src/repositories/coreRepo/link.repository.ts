import { LinkStatus } from "../../enums/linkStatus.enum";
import { Op } from "sequelize";
import { Link } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { DistributionType } from "../../enums/distribution.enum";

export const getLinkListRepo = async (filters: {
  campaignId?: number;
  status?: LinkStatus;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<{ links: Link[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.status) where.status = filters.status;
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
    if (filters.page && filters.limit && filters.page > 0 && filters.limit > 0) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: links, count: total } = await Link.findAndCountAll(queryOptions);

    return { links, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createLinkRepo = async (data: {
  campaignId: number;
  link: string;
  linkTo: string;
  distribution: DistributionType;
  anchorText: string;
  status: LinkStatus;
  url: string;
  page: string;
  traffic: number;
}): Promise<Link> => {
  try {
    const link = await Link.create(data);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getLinkByIdRepo = async (id: number): Promise<Link | null> => {
  try {
    const link = await Link.findByPk(id);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};