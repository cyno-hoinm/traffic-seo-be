import { Op } from "sequelize";
import { CampaignStatus } from "../../enums/campaign.enum";
import { Campaign } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { CampaignTypeAttributes } from "../../interfaces/CampaignType.interface";

export const getCampaignListRepo = async (filters: {
  userId?: number;
  countryId?: number;
  type?: string;
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
    if (filters.type) where.type = filters.type;
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

// export const getCampaignReport = async (filters: {}): Promise<{
//   campaigns: Campaign[];
//   total: number;
// }> => {};
