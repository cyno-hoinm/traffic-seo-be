import { LinkStatus } from "../../enums/linkStatus.enum";
import { Op } from "sequelize";
import { Link, sequelizeSystem } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { DistributionType } from "../../enums/distribution.enum";
import statusCode from "../../constants/statusCode";
import { LinkAttributes } from "../../interfaces/Link.interface";
import { IndexStatus } from "../../enums/indexStatus.enum";

export const getLinkListRepo = async (filters: {
  campaignId?: number;
  status?: LinkStatus;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<{ links: LinkAttributes[]; total: number }> => {
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
    if (
      filters.page &&
      filters.limit &&
      filters.page > 0 &&
      filters.limit > 0
    ) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: links, count: total } = await Link.findAndCountAll(
      queryOptions
    );

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
  cost: number;
  traffic: number;
}): Promise<LinkAttributes> => {
  try {
    const link = await Link.create(data);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getLinkByIdRepo = async (
  id: number
): Promise<LinkAttributes | null> => {
  try {
    const link = await Link.findByPk(id);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getLinksReport = async (
  key: string, // Determines the field to group by: "distribution" or "status"
  startDate?: string, // Optional: filter links by createdAt
  endDate?: string // Optional: filter links by createdAt
): Promise<{ keyValue: string; count: number }[]> => {
  try {
    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    // Link filter
    const linkWhere: any = { isDeleted: false };

    // Date range filter for links
    if (startDate || endDate) {
      linkWhere[Op.and] = [];
      if (startDate) {
        linkWhere[Op.and].push({ createdAt: { [Op.gte]: startDate } });
      }
      if (endDate) {
        linkWhere[Op.and].push({ createdAt: { [Op.lte]: endDate } });
      }
    }

    // Determine the field to group by
    const groupField = key === "status" ? "status" : "distribution";

    const queryOptions: any = {
      where: linkWhere,
      group: [groupField], // Group by distribution or status
      attributes: [
        groupField,
        [sequelizeSystem.fn("COUNT", sequelizeSystem.col(groupField)), "count"],
      ],
      raw: true,
    };

    const result = await Link.findAll(queryOptions);

    return result.map((item: any) => ({
      keyValue: item[groupField], // Use dynamic field name
      count: item.count,
    }));
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateLinkRepo = async (
  id: number,
  data: Partial<{
    link: string;
    linkTo: string;
    distribution: DistributionType;
    anchorText: string;
    status: LinkStatus;
    url: string;
    page: string;
    isDeleted: boolean;
  }>
): Promise<LinkAttributes> => {
  try {
    const link = await Link.findByPk(id);
    if (!link) {
      throw new ErrorType(
        "NotFoundError",
        `Link with id ${id} not found`,
        statusCode.NOT_FOUND
      );
    }

    // Create a new object with only defined values
    const updateData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await link.update(updateData);
    return link;
  } catch (error: any) {
    throw new ErrorType(
      error.name,
      error.message,
      error.code || statusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const getLinkByCampaignIdRepo = async (
  campaignId: number
): Promise<{ links: LinkAttributes[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };

    if (campaignId) where.campaignId = campaignId;

    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
    };

    // Apply pagination only if page and limit are not 0

    const { rows: links, count: total } = await Link.findAndCountAll(
      queryOptions
    );

    return { links, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateIndexStatusByUrlRepo = async (
  updates: Array<{ url: string; indexStatus: IndexStatus }>
) => {
  try {
    const results = [];
    
    for (const { url, indexStatus } of updates) {
      const [affectedCount] = await Link.update(
        { indexStatus },
        { where: { link: url } }
      );

      results.push({
        url,
        success: affectedCount > 0,
        message: affectedCount > 0 ? "Updated successfully" : `Link with url ${url} not found`
      });
    }

    return results;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
