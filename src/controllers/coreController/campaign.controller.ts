import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getCampaignListRepo,
  createCampaignRepo,
  getCampaignByIdRepo,
  continueCampaignRepo,
  pauseCampaignRepo,
  cancelCampaignRepo,
} from "../../repositories/coreRepo/campagin.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { CampaignAttributes } from "../../interfaces/Campaign.interface";
import { CampaignStatus } from "../../enums/campaign.enum";
import { DistributionType } from "../../enums/distribution.enum";
import { LinkStatus } from "../../enums/linkStatus.enum";
import { sequelizeSystem } from "../../database/mySQL/config.database";
import { Transaction } from "sequelize";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { Campaign, Keyword, Link } from "../../models/index.model";
import { baseApiPython, baseApiPythonUpdate } from "../../config/botAPI.config";
import { getConfigByNameRepo } from "../../repositories/commonRepo/config.repository";
import { ConfigApp } from "../../constants/config.constants";
import { ErrorType } from "../../types/Error.type";
import {
  compareWalletAmount,
  getWalletByUserIdRepo,
} from "../../repositories/moneyRepo/wallet.repository";

import { createTransactionRepo } from "../../repositories/moneyRepo/transaction.repository";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { TransactionType } from "../../enums/transactionType.enum";
import { calculateCampaignMetrics, formatDate } from "../../utils/utils";
import { keywordStatus } from "../../enums/keywordStatus.enum";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { createNotificationRepo } from "../../repositories/commonRepo/notification.repository";
import { notificationType } from "../../enums/notification.enum";

// Get campaign list with filters

export const getCampaignList = async (
  req: Request,
  res: Response<
    ResponseType<{ campaigns: CampaignAttributes[]; total: number }>
  >
): Promise<void> => {
  try {
    const {
      key,
      userId,
      countryId,
      campaignTypeId,
      device,
      title,
      startDate,
      endDate,
      status,
      page,
      limit,
    } = req.body;

    const filters: {
      key?: string;
      userId?: number;
      countryId?: number;
      campaignTypeId?: number;
      device?: string;
      title?: string;
      startDate?: Date;
      endDate?: Date;
      status?: CampaignStatus;
      page?: number;
      limit?: number;
    } = {};
    if (page) {
      filters.page = page;
    }
    if (limit) {
      filters.limit = limit;
    }

    if (userId) filters.userId = Number(userId);
    if (countryId) filters.countryId = Number(countryId);
    if (campaignTypeId) {
      filters.campaignTypeId = Number(campaignTypeId);
    }
    if (device) filters.device = device as string;
    if (title) filters.title = title as string;
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
    if (key) {
      filters.key = key;
    }

    const campaigns = await getCampaignListRepo(filters);

    res.status(statusCode.OK).json({
      status: true,
      message: "Campaigns retrieved successfully",
      data: {
        campaigns: campaigns.campaigns.map((campaign: CampaignAttributes) => {
          // Calculate metrics for each campaign
          const { totalTraffic, totalCost } = calculateCampaignMetrics(
            campaign.links,
            campaign.keywords
          );

          return {
            id: campaign.id,
            userId: campaign.userId,
            username: campaign.users?.username,
            countryId: campaign.countryId,
            name: campaign.name,
            campaignTypeId: campaign.campaignTypeId,
            device: campaign.device,
            title: campaign.title,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            totalTraffic, // Calculated from links and keywords
            totalCost: totalCost, // Calculated from links and keywords
            domain: campaign.domain,
            search: campaign.search,
            status: campaign.status,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
          };
        }),
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

export const createCampaign = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const {
      userId,
      countryId,
      name,
      device,
      title,
      startDate,
      endDate,
      domain,
      search,
      campaignTypeId,
      keywords,
      links,
    } = req.body;

    // Validate required fields
    if (!validateRequiredFields(campaignTypeId, req.body)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All required fields must be provided",
        error: "Missing or invalid field",
      });
      return;
    }

    // Validate dates
    const { start, end, currentDate } = validateDates(startDate, endDate);
    if (!start || !end) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid date format for startDate or endDate",
        error: "Invalid field",
      });
      return;
    }

    if (start >= end) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "startDate must be before endDate",
        error: "Invalid date range",
      });
      return;
    }

    // Calculate costs and validate wallet
    const { totalCost, totalTraffic } = await calculateCampaignCosts(
      keywords,
      links
    );
    const isValidWallet = await compareWalletAmount(userId, totalCost);
    if (!isValidWallet) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Insufficient balance",
        error: "Invalid wallet",
      });
      return;
    }

    // Validate keywords and links
    if (!validateKeywords(keywords, res) || !validateLinks(links, res)) {
      return;
    }

    // Create campaign with transaction
    const campaign = await createCampaignWithTransaction({
      userId,
      countryId,
      name,
      device,
      title,
      start,
      end,
      domain,
      search,
      campaignTypeId,
      keywords,
      links,
      currentDate,
      totalCost,
    });

    // Fetch campaign with associations
    const campaignWithAssociations = await Campaign.findByPk(campaign.id, {
      include: [
        { model: Keyword, as: "keywords" },
        { model: Link, as: "links" },
      ],
    });

    if (campaignWithAssociations) {
      await sendCampaignNotifications(
        campaignWithAssociations,
        userId,
        name,
        totalCost
      );
    }

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Campaign created successfully",
      data: formatCampaignResponse(
        campaignWithAssociations,
        totalTraffic,
        totalCost
      ),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating campaign",
      error: error.message,
    });
  }
};

// Helper functions
const validateRequiredFields = (campaignTypeId: number, data: any): boolean => {
  const requiredFields =
    campaignTypeId !== 3
      ? [
          "userId",
          "countryId",
          "name",
          "device",
          "title",
          "startDate",
          "endDate",
          "domain",
          "search",
          "campaignTypeId",
        ]
      : [
          "userId",
          "countryId",
          "name",
          "title",
          "startDate",
          "endDate",
          "campaignTypeId",
        ];

  return requiredFields.every((field) => data[field]);
};

const validateDates = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date();

  [start, end, currentDate].forEach((date) => date.setHours(0, 0, 0, 0));

  return {
    start: isNaN(start.getTime()) ? null : start,
    end: isNaN(end.getTime()) ? null : end,
    currentDate,
  };
};

const calculateCampaignCosts = async (keywords: any[], links: any[]) => {
  const keywordTrafficCost = await getConfigValue(
    ConfigApp.KEYWORD_TRAFFIC_COST
  );
  const linkTrafficCost = await getConfigValue(ConfigApp.LINK_TRAFFIC_COST);

  const totalKeywordTraffic =
    keywords?.reduce((sum, item) => sum + item.traffic, 0) || 0;
  const totalLinkTraffic =
    links?.reduce((sum, item) => sum + item.traffic, 0) || 0;

  return {
    totalCost:
      totalKeywordTraffic * keywordTrafficCost +
      totalLinkTraffic * linkTrafficCost,
    totalTraffic: totalKeywordTraffic + totalLinkTraffic,
  };
};

const getConfigValue = async (configName: string): Promise<number> => {
  const config = await getConfigByNameRepo(configName);
  if (!config) {
    throw new ErrorType(
      "ConfigError",
      `Configuration for ${configName} not found`
    );
  }
  return parseFloat(config.value);
};

const validateKeywords = (keywords: any[], res: Response): boolean => {
  if (!keywords) return true;
  if (!Array.isArray(keywords)) {
    res.status(statusCode.BAD_REQUEST).json({
      status: false,
      message: "Keywords must be an array",
      error: "Invalid field",
    });
    return false;
  }

  const isValid = keywords.every(
    (keyword) =>
      keyword.name &&
      keyword.urls &&
      Array.isArray(keyword.urls) &&
      keyword.distribution &&
      Object.values(DistributionType).includes(keyword.distribution)
  );

  if (!isValid) {
    res.status(statusCode.BAD_REQUEST).json({
      status: false,
      message:
        "Each keyword must have a valid name, urls array, and distribution",
      error: "Invalid field",
    });
    return false;
  }

  return true;
};

const validateLinks = (links: any[], res: Response): boolean => {
  if (!links) return true;
  if (!Array.isArray(links)) {
    res.status(statusCode.BAD_REQUEST).json({
      status: false,
      message: "Links must be an array",
      error: "Invalid field",
    });
    return false;
  }

  const isValid = links.every((link) => link.link);
  if (!isValid) {
    res.status(statusCode.BAD_REQUEST).json({
      status: false,
      message:
        "Each link must have valid link, linkTo, distribution, anchorText, status, url, and page",
      error: "Invalid field",
    });
    return false;
  }

  return true;
};

const createCampaignWithTransaction = async (data: any) => {
  return await sequelizeSystem.transaction(async (transaction: Transaction) => {
    const campaign = await createCampaignRepo(
      {
        userId: data.userId,
        countryId: data.countryId,
        name: data.name,
        device: data.campaignTypeId === 3 ? null : data.device,
        title: data.title,
        startDate: data.start,
        endDate: data.end,
        domain: data.campaignTypeId === 3 ? null : data.domain,
        search: data.campaignTypeId === 3 ? null : data.search,
        campaignTypeId: data.campaignTypeId,
        status:
          data.start > data.currentDate
            ? CampaignStatus.NOT_STARTED
            : CampaignStatus.ACTIVE,
        isDeleted: false,
      },
      transaction
    );

    if (!campaign.id) {
      throw new Error("Failed to create campaign");
    }

    await createKeywords(
      campaign,
      data.keywords,
      data.start,
      data.currentDate,
      transaction
    );
    await createLinks(
      campaign,
      data.links,
      data.start,
      data.currentDate,
      transaction
    );
    await createTransaction(
      data.userId,
      campaign.id,
      data.totalCost,
      transaction
    );

    return campaign;
  });
};

const createKeywords = async (
  campaign: any,
  keywords: any[],
  start: Date,
  currentDate: Date,
  transaction: Transaction
) => {
  if (!keywords?.length) return;

  for (const keyword of keywords) {
    const keywordData = {
      campaignId: campaign.id,
      name: keyword.name,
      urls: keyword.urls,
      cost: keyword.traffic * 1,
      status:
        start > currentDate ? keywordStatus.INACTIVE : keywordStatus.ACTIVE,
      distribution: keyword.distribution,
      traffic: keyword.traffic || 0,
      isDeleted: false,
    };

    const newKeyword = await Keyword.create(keywordData, { transaction });
    await baseApiPython("keyword/set", {
      keywordId: newKeyword.id,
      title: campaign.title,
      keyword: newKeyword.name,
      urls: newKeyword.urls,
      distribution: newKeyword.distribution,
      traffic: newKeyword.traffic || 0,
      device: campaign.device,
      domain: campaign.domain,
      timeStart: campaign.startDate,
      timeEnd: campaign.endDate,
      searchTool: campaign.search,
    });
  }
};

const createLinks = async (
  campaign: any,
  links: any[],
  start: Date,
  currentDate: Date,
  transaction: Transaction
) => {
  if (!links?.length) return;

  const linkData = links.map((link) => ({
    campaignId: campaign.id,
    link: link.link,
    linkTo: link.linkTo,
    distribution: link.distribution,
    traffic: link.traffic || 0,
    cost: (link.traffic || 0) * 5,
    anchorText: link.anchorText,
    status: start > currentDate ? LinkStatus.INACTIVE : link.status,
    url: link.url,
    page: link.page,
    isDeleted: false,
  }));

  await Link.bulkCreate(linkData, { transaction });
};

const createTransaction = async (
  userId: number,
  campaignId: number,
  totalCost: number,
  transaction: Transaction
) => {
  const wallet = await getWalletByUserIdRepo(userId);
  if (!wallet) {
    throw new Error("Wallet not found!");
  }

  await createTransactionRepo(
    {
      walletId: wallet.id || 0,
      amount: totalCost,
      referenceId: campaignId.toString(),
      status: TransactionStatus.COMPLETED,
      type: TransactionType.PAY_SERVICE,
    },
    transaction
  );
};

const sendCampaignNotifications = async (
  campaign: any,
  userId: number,
  name: string,
  totalCost: number
) => {
  const notificationData = {
    userId: [userId],
    name,
    type: notificationType.CREATE_CAMPAIGN,
  };

  // Send creation notification
  await createNotificationRepo({
    ...notificationData,
    content: `Campaign ${campaign.name} has been created successfully with cost ${totalCost} credit`,
  });

  // Send running notification if campaign is active
  if (campaign.status === CampaignStatus.ACTIVE) {
    await createNotificationRepo({
      ...notificationData,
      content: `Campaign ${campaign.name} is running`,
      type: notificationType.RUNNING_CAMPAIGN,
    });
  }
};

const formatCampaignResponse = (
  campaign: any,
  totalTraffic: number,
  totalCost: number
) => ({
  id: campaign?.id,
  userId: campaign?.userId,
  countryId: campaign?.countryId,
  name: campaign?.name,
  campaignTypeId: campaign?.campaignTypeId,
  device: campaign?.device,
  title: campaign?.title,
  startDate: campaign?.startDate,
  endDate: campaign?.endDate,
  totalTraffic,
  cost: totalCost,
  domain: campaign?.domain,
  search: campaign?.search,
  status: campaign?.status,
  keywords: campaign?.keywords || [],
  links: campaign?.links || [],
  createdAt: campaign?.createdAt,
  updatedAt: campaign?.updatedAt,
});

// Get campaign by ID
export const getCampaignById = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<CampaignAttributes>>
): Promise<void> => {
  try {
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
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
    if (user.role.id === 2 && user.id !== campaign.userId) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You not have permission",
        error: "You not have permission",
      });
      return;
    }
    // Calculate total traffic and cost from links and keywords
    const metrics = calculateCampaignMetrics(campaign.links, campaign.keywords);

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
        title: campaign.title,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalTraffic: metrics.totalTraffic,
        totalCost: metrics.totalCost,
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

export const pauseCampaign = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const campaignId = parseInt(req.params.id, 10);

    // Fetch the campaign to get keywords and endDate
    const campaign: CampaignAttributes | null = await getCampaignByIdRepo(
      campaignId
    ); // Assume a function to fetch campaign
    if (!campaign) {
      throw new ErrorType(
        "NotFoundError",
        "Campaign not found",
        statusCode.NOT_FOUND
      );
    }

    // Update Python API for keywords first
    if (campaign.keywords && campaign.keywords.length > 0) {
      const apiPromises = campaign.keywords.map(
        async (keyword: KeywordAttributes) => {
          const dataPython = {
            keywordId: keyword.id,
            timeEnd: formatDate(new Date()),
          };
          return baseApiPythonUpdate("keyword/update", dataPython);
        }
      );

      // Wait for all Python API calls to complete
      await Promise.all(apiPromises);
    }

    // Update campaign in your server after Python API calls
    const updatedCampaign: boolean = await pauseCampaignRepo(campaignId);
    if (updatedCampaign) {
      res.status(statusCode.OK).json({
        status: true,
        message: "Pause campaign successfully",
      });
    } else {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Pause campaign failed",
      });
    }
    return;
  } catch (error: any) {
    const errorResponse =
      error instanceof ErrorType
        ? error
        : new ErrorType(
            "UnknownError",
            "Failed to Pause campaign",
            statusCode.INTERNAL_SERVER_ERROR
          );
    res.status(errorResponse.code || statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: errorResponse.message,
    });
    return;
  }
};

export const getContinueCampaign = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const campaignId = parseInt(req.params.id, 10);

    // Fetch the campaign to get keywords and endDate
    const campaign: CampaignAttributes | null = await getCampaignByIdRepo(
      campaignId
    ); // Assume a function to fetch campaign
    if (!campaign) {
      throw new ErrorType(
        "NotFoundError",
        "Campaign not found",
        statusCode.NOT_FOUND
      );
    }

    // Update Python API for keywords first
    if (campaign.keywords && campaign.keywords.length > 0) {
      const apiPromises = campaign.keywords.map(
        async (keyword: KeywordAttributes) => {
          const dataPython = {
            keywordId: keyword.id,
            timeEnd: formatDate(campaign.endDate),
          };
          return baseApiPythonUpdate("keyword/update", dataPython);
        }
      );

      // Wait for all Python API calls to complete
      await Promise.all(apiPromises);
    }

    // Update campaign in your server after Python API calls
    const updatedCampaign: boolean = await continueCampaignRepo(campaignId);
    if (updatedCampaign) {
      res.status(statusCode.OK).json({
        status: true,
        message: "Continue campaign successfully",
      });
    } else {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Continue campaign failed",
      });
    }
    return;
  } catch (error: any) {
    const errorResponse =
      error instanceof ErrorType
        ? error
        : new ErrorType(
            "UnknownError",
            "Failed to continue campaign",
            statusCode.INTERNAL_SERVER_ERROR
          );
    res.status(errorResponse.code || statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: errorResponse.message,
    });
    return;
  }
};

export const cancelCampaign = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const campaignId = parseInt(req.params.id, 10);

    // Fetch the campaign to get keywords and endDate
    const campaign: CampaignAttributes | null = await getCampaignByIdRepo(
      campaignId
    ); // Assume a function to fetch campaign
    if (!campaign) {
      throw new ErrorType(
        "NotFoundError",
        "Campaign not found",
        statusCode.NOT_FOUND
      );
    }

    // Update Python API for keywords first
    if (campaign.keywords && campaign.keywords.length > 0) {
      const activeKeywords = campaign.keywords.filter(
        (keyword: KeywordAttributes) => keyword.status === keywordStatus.ACTIVE
      );

      const apiPromises = activeKeywords.map(
        async (keyword: KeywordAttributes) => {
          const dataPython = {
            keywordId: keyword.id,
            timeEnd: formatDate(new Date()),
          };
          return baseApiPythonUpdate("keyword/update", dataPython);
        }
      );

      // Wait for all Python API calls to complete
      await Promise.all(apiPromises);
    }
    // Update campaign in your server after Python API calls
    const updatedCampaign: boolean = await cancelCampaignRepo(campaignId);
    if (updatedCampaign) {
      res.status(statusCode.OK).json({
        status: true,
        message: "Stop campaign successfully",
      });
    } else {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Stop campaign failed",
      });
    }
    return;
  } catch (error: any) {
    const errorResponse =
      error instanceof ErrorType
        ? error
        : new ErrorType(
            "UnknownError",
            "Failed to Stop campaign",
            statusCode.INTERNAL_SERVER_ERROR
          );
    res.status(errorResponse.code || statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: errorResponse.message,
    });
    return;
  }
};
