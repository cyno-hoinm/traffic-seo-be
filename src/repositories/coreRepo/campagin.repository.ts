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
  status?: CampaignStatus,
  startDate?: string,
  endDate?: string,
  userId?: number
): Promise<any[]> => {
  try {
    // Validate date formats if provided
    if (startDate && !isValidDate(startDate)) {
      throw new ErrorType('ValidationError', 'Invalid start date format');
    }
    if (endDate && !isValidDate(endDate)) {
      throw new ErrorType('ValidationError', 'Invalid end date format');
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
      throw new ErrorType('InitializationError', 'Sequelize instance is not initialized');
    }

    const results = await Campaign.findAll({
      where,
      include: [
        {
          model: CampaignType,
          as: 'campaignTypes',
          attributes: ['name'],
          required: true, // Inner join to ensure only campaigns with valid campaign types are included
        },
      ],
      group: ['Campaign.campaignTypeId', 'campaignTypes.name'],
      attributes: [
        'campaignTypeId',
        [sequelizeSystem.fn('COUNT', sequelizeSystem.col('Campaign.campaignTypeId')), 'count'],
      ],
      raw: true,
    });

    return results.map((item: any) => ({
      campaignTypeId: item.campaignTypeId,
      campaignTypeName: item['campaignTypes.name'],
      count: parseInt(item.count, 10),
    }));
  } catch (error) {
    console.error('Error fetching campaign report:', error);
    throw error instanceof ErrorType
      ? error
      : new ErrorType('UnknownError', 'Failed to fetch campaign report');
  }
};
export interface CampaignReportList {
  campaignTypeId: number;
  campaignTypeName: string;
  count: number;
}

// Utility function to validate YYYY-MM-DD date format
const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString);
};
