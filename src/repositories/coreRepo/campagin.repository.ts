import { Op } from "sequelize";
import { CampaignStatus } from "../../enums/campaign.enum";
import { Campaign, sequelizeSystem } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { CampaignTypeAttributes } from "../../interfaces/CampaignType.interface";
import CampaignType from "../../models/CampaignType.model";

export const getCampaignListRepo = async (filters: {
  userId?: number;
  countryId?: number;
  campaignTypeId?: number;
  device?: string;
  timeCode?: string;
  startDate?: Date;
  endDate?: Date;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}): Promise<{ campaigns: Campaign[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };
    if (filters.userId) where.userId = filters.userId;
    if (filters.countryId) where.countryId = filters.countryId;
    if (filters.campaignTypeId) where.campaignTypeId = filters.campaignTypeId;
    if (filters.device) where.device = filters.device;
    if (filters.timeCode) where.timeCode = filters.timeCode;
    if (filters.startDate) where.startDate = { [Op.gte]: filters.startDate };
    if (filters.endDate) where.endDate = { [Op.lte]: filters.endDate };
    if (filters.status) where.status = filters.status;

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

    const { rows: campaigns, count: total } = await Campaign.findAndCountAll(
      queryOptions
    );

    return { campaigns, total };
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

export const getCampaignReport = async (
  key: string | undefined,
  startDate?: string,
  endDate?: string
): Promise<any> => {
  try {
    const where: any = { isDeleted: false };

    // Add date range filter if provided
    if (startDate || endDate) {
      where[Op.and] = [];
      if (startDate) {
        where[Op.and].push({ start_date: { [Op.gte]: startDate } });
      }
      if (endDate) {
        where[Op.and].push({ end_date: { [Op.lte]: endDate } });
      }
    }

    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    if (key === "type") {
      const result = await Campaign.findAll({
        where,
        group: ["campaignTypeId", "campaignTypes.name"],
        attributes: [
          "campaignTypeId",
          [
            sequelizeSystem.fn("COUNT", sequelizeSystem.col("campaignTypeId")),
            "count",
          ],
        ],
        include: [
          {
            model: CampaignType,
            as: "campaignTypes",
            attributes: ["name"],
            required: true,
          },
        ],
        raw: true,
      });

      return result.map((item: any) => ({
        campaignTypeId: item.campaignTypeId,
        count: item.count,
        campaignTypeName: item["campaignTypes.name"],
      }));
    }

    if (key === "status") {
      const result = await Campaign.findAll({
        where,
        group: ["status"],
        attributes: [
          "status",
          [sequelizeSystem.fn("COUNT", sequelizeSystem.col("status")), "count"],
        ],
        raw: true,
      });

      return result.map((item: any) => ({
        status: item.status,
        count: item.count,
      }));
    }

    return [];
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
