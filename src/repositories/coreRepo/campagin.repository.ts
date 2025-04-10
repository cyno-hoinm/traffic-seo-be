import { Op } from "sequelize";
import { CampaignStatus } from "../../enums/campaign.enum";
import { Campaign } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

// Get campaign list with filters
export const getCampaignListRepo = async (filters: {
  userId?: number;
  countryId?: number;
  type?: string;
  device?: string;
  timeCode?: string;
  startDate?: Date;
  endDate?: Date;
  status?: CampaignStatus;
}): Promise<Campaign[]> => {
  try {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.countryId) where.countryId = filters.countryId;
    if (filters.type) where.type = filters.type;
    if (filters.device) where.device = filters.device;
    if (filters.timeCode) where.timeCode = filters.timeCode;
    if (filters.startDate) where.startDate = { [Op.gte]: filters.startDate };
    if (filters.endDate) where.endDate = { [Op.lte]: filters.endDate };
    if (filters.status) where.status = filters.status;

    const campaigns = await Campaign.findAll({ where });
    return campaigns;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Create a new campaign
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

// Get campaign by ID
export const getCampaignByIdRepo = async (
  id: number
): Promise<Campaign | null> => {
  try {
    const campaign = await Campaign.findByPk(id);
    return campaign;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
