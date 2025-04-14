import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getCampaignListRepo,
  createCampaignRepo,
  getCampaignByIdRepo,
} from "../../repositories/coreRepo/campagin.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { CampaignAttributes } from "../../interfaces/Campaign.interface";
import { CampaignStatus } from "../../enums/campaign.enum";
import { CampaignTypeAttributes } from "../../interfaces/CampaignType.interface";

// Get campaign list with filters
export const getCampaignList = async (
  req: Request,
  res: Response<
    ResponseType<{ campaigns: CampaignAttributes[]; total: number }>
  >
): Promise<void> => {
  try {
    const {
      userId,
      countryId,
      campaignTypeId,
      device,
      timeCode,
      startDate,
      endDate,
      status,
      page,
      limit,
    } = req.body;

    const filters: {
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
    } = {};
    filters.page =
      typeof page === "string" && !isNaN(parseInt(page)) ? parseInt(page) : 0;
    filters.limit =
      typeof limit === "string" && !isNaN(parseInt(limit))
        ? parseInt(limit)
        : 0;
    if (userId) filters.userId = Number(userId);
    if (countryId) filters.countryId = Number(countryId);
    if (campaignTypeId) {
      filters.campaignTypeId = Number(campaignTypeId); 
    }
    if (device) filters.device = device as string;
    if (timeCode) filters.timeCode = timeCode as string;
    if (startDate) {
      const start = new Date(startDate as string);
      if (isNaN(start.getTime())) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid startDate format",
          error: "Invalid field",
        });
        return;
      }
      filters.startDate = start;
    }
    if (endDate) {
      const end = new Date(endDate as string);
      if (isNaN(end.getTime())) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid endDate format",
          error: "Invalid field",
        });
        return;
      }
      filters.endDate = end;
    }
    if (
      status &&
      Object.values(CampaignStatus).includes(status as CampaignStatus)
    ) {
      filters.status = status as CampaignStatus;
    } else if (status) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (ACTIVE, INACTIVE, PENDING)",
        error: "Invalid field",
      });
      return;
    }

    const campaigns = await getCampaignListRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Campaigns retrieved successfully",
      data: {
        campaigns: campaigns.campaigns.map((campaign: CampaignAttributes) => ({
          id: campaign.id,
          userId: campaign.userId,
          countryId: campaign.countryId,
          name: campaign.name,
          campaignTypeId: campaign.campaignTypeId,
          device: campaign.device,
          timeCode: campaign.timeCode,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          totalTraffic: campaign.totalTraffic,
          cost: campaign.cost,
          domain: campaign.domain,
          search: campaign.search,
          status: campaign.status,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        })),
        total: campaigns.total,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching campaigns",
      error: error.message,
    });
  }
};

// Create a new campaign
export const createCampaign = async (
  req: Request,
  res: Response<ResponseType<CampaignAttributes>>
): Promise<void> => {
  try {
    const {
      userId,
      countryId,
      name,
      type,
      device,
      timeCode,
      startDate,
      endDate,
      totalTraffic,
      cost,
      domain,
      search,
      keyword,
      status,
      campaignTypeId,
    } = req.body;

    if (
      !userId ||
      !countryId ||
      !name ||
      !type ||
      !device ||
      !timeCode ||
      !startDate ||
      !endDate ||
      !totalTraffic ||
      cost === undefined ||
      isNaN(cost) ||
      !domain ||
      !search ||
      !campaignTypeId ||
      !keyword ||
      !status
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All fields are required",
        error: "Missing or invalid field",
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid date format for startDate or endDate",
        error: "Invalid field",
      });
      return;
    }

    if (!Object.values(CampaignStatus).includes(status)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (ACTIVE, INACTIVE, PENDING)",
        error: "Invalid field",
      });
      return;
    }

    const campaign = await createCampaignRepo({
      userId,
      countryId,
      name,
      type,
      device,
      timeCode,
      startDate: start,
      endDate: end,
      totalTraffic,
      cost,
      domain,
      search,
      campaignTypeId,
      keyword,
      status,
    });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Campaign created successfully",
      data: {
        id: campaign.id,
        userId: campaign.userId,
        countryId: campaign.countryId,
        name: campaign.name,
        campaignTypeId: campaign.campaignTypeId,
        device: campaign.device,
        timeCode: campaign.timeCode,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalTraffic: campaign.totalTraffic,
        cost: campaign.cost,
        domain: campaign.domain,
        search: campaign.search,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating campaign",
      error: error.message,
    });
  }
};

// Get campaign by ID
export const getCampaignById = async (
  req: Request,
  res: Response<ResponseType<CampaignAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await getCampaignByIdRepo(Number(id));
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Campaign retrieved successfully",
      data: {
        id: campaign.id,
        userId: campaign.userId,
        countryId: campaign.countryId,
        name: campaign.name,
        campaignTypeId: campaign.campaignTypeId,
        device: campaign.device,
        timeCode: campaign.timeCode,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalTraffic: campaign.totalTraffic,
        cost: campaign.cost,
        domain: campaign.domain,
        search: campaign.search,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching campaign",
      error: error.message,
    });
  }
};
