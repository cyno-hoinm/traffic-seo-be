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
import { DistributionType } from "../../enums/distribution.enum";
import { LinkStatus } from "../../enums/linkStatus.enum";
import { sequelizeSystem } from "../../database/mySQL/config.database";
import { Transaction } from "sequelize";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { Campaign, Keyword, Link } from "../../models/index.model";
import { LinkAttributes } from "../../interfaces/Link.interface";
import { baseApiPython } from "../../config/botAPI.config";
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
import { calculateCampaignMetrics } from "../../utils/utils";
import { filter } from "compression";

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
      status,
      campaignTypeId,
      keywords, // Array of KeywordAttributes, optional
      links, // Array of LinkAttributes, optional
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !countryId ||
      !name ||
      !device ||
      !title ||
      !startDate ||
      !endDate ||
      !domain ||
      !search ||
      !campaignTypeId ||
      !status
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All required fields must be provided",
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
    let keywordTrafficCost = 1;
    const KEYWORD_TRAFFIC_COST = await getConfigByNameRepo(
      ConfigApp.KEYWORD_TRAFFIC_COST
    );
    if (KEYWORD_TRAFFIC_COST) {
      keywordTrafficCost = parseFloat(KEYWORD_TRAFFIC_COST.value);
    } else {
      throw new ErrorType(
        "ConfigError",
        "Configuration for KEYWORD_TRAFFIC_COST not found"
      );
    }
    let linkTrafficCost = 1;
    const LINK_TRAFFIC_COST = await getConfigByNameRepo(
      ConfigApp.LINK_TRAFFIC_COST
    );
    if (LINK_TRAFFIC_COST) {
      linkTrafficCost = parseFloat(LINK_TRAFFIC_COST.value);
    } else {
      throw new ErrorType(
        "ConfigError",
        "Configuration for LINK_TRAFFIC_COST not found"
      );
    }
    const totalKeywordTraffic = keywords
      ? keywords.reduce((sum: number, item: Keyword) => sum + item.traffic, 0)
      : 0;
    const totalLinkTraffic = links
      ? links.reduce((sum: number, item: Keyword) => sum + item.traffic, 0)
      : 0;
    const totalCost =
      totalKeywordTraffic * keywordTrafficCost +
      totalLinkTraffic * linkTrafficCost;
    const totalTraffic = totalKeywordTraffic + totalLinkTraffic;
    const isValidWallet = await compareWalletAmount(userId, totalCost);
    if (!isValidWallet) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Insufficient balance",
        error: "Invalid wallet",
      });
      return;
    }
    // Validate keywords if provided
    if (keywords) {
      if (!Array.isArray(keywords)) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Keywords must be an array",
          error: "Invalid field",
        });
        return;
      }
      for (const keyword of keywords) {
        if (
          !keyword.name ||
          !keyword.urls ||
          !Array.isArray(keyword.urls) ||
          !keyword.distribution ||
          !Object.values(DistributionType).includes(keyword.distribution)
        ) {
          res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Each keyword must have a valid name, urls array, and distribution",
            error: "Invalid field",
          });
          return;
        }
      }
    }

    // Validate links if provided
    if (links) {
      if (!Array.isArray(links)) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Links must be an array",
          error: "Invalid field",
        });
        return;
      }
      for (const link of links) {
        if (
          !link.link ||
          !link.linkTo ||
          !link.distribution ||
          !Object.values(DistributionType).includes(link.distribution) ||
          !link.anchorText ||
          !link.status ||
          !Object.values(LinkStatus).includes(link.status) ||
          !link.url ||
          !link.page
        ) {
          res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Each link must have valid link, linkTo, distribution, anchorText, status, url, and page",
            error: "Invalid field",
          });
          return;
        }
      }
    }

    // Use a transaction to ensure data consistency
    const campaign = await sequelizeSystem.transaction(
      async (transaction: Transaction) => {
        // Create the campaign
        const campaign = await createCampaignRepo(
          {
            userId,
            countryId,
            name,
            device,
            title,
            startDate: start,
            endDate: end,
            domain,
            search,
            campaignTypeId,
            status,
            isDeleted: false, // Set default value
          },
          transaction
        );
        if (!campaign.id) {
          throw new Error("Failed to create campaign");
        }
        // Insert keywords if provided
        if (keywords && keywords.length > 0) {
          for (const keyword of keywords) {
            const cost = keyword.traffic * 1;
            const keywordData: KeywordAttributes = {
              campaignId: campaign.id,
              name: keyword.name,
              urls: keyword.urls,
              cost: cost,
              distribution: keyword.distribution,
              traffic: keyword.traffic || 0,
              isDeleted: false,
            };
            // Call Python API for each keyword
            const newKeyword = await Keyword.create(keywordData, {
              transaction,
            });
            const dataPython = {
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
            };
            await baseApiPython("keyword/set", dataPython);
            // console.log(result);
            // Create keyword in database
          }
        }

        // Insert links if provided
        if (links && links.length > 0) {
          const linkData = links.map((link: Partial<LinkAttributes>) => ({
            campaignId: campaign.id,
            link: link.link,
            linkTo: link.linkTo,
            distribution: link.distribution,
            traffic: link.traffic || 0,
            cost: (link.traffic || 0) * 1,
            anchorText: link.anchorText,
            status: link.status,
            url: link.url,
            page: link.page,
            isDeleted: false,
          }));
          await Link.bulkCreate(linkData, { transaction });
        }

        // await updateWalletBalanceByUserId(userId,{balance: totalCost})
        const wallet = await getWalletByUserIdRepo(userId);
        if (wallet) {
          await createTransactionRepo({
            walletId: wallet.id || 0,
            amount: totalCost,
            referenceId : campaign.id ? campaign.id.toString() : "NULL",
            status: TransactionStatus.COMPLETED,
            type: TransactionType.PAY_SERVICE,
          });
        } else {
          throw new Error("Wallet not found!");
        }

        return campaign;
      }
    );

    // Fetch the campaign with associated keywords and links for response
    const campaignWithAssociations = await Campaign.findByPk(campaign.id, {
      include: [
        { model: Keyword, as: "keywords" },
        { model: Link, as: "links" },
      ],
    });
    // // SUM cost từ keyword
    // const keywordCostResult = await Keyword.findOne({
    //   where: { campaignId: campaignWithAssociations?.id },
    //   attributes: [[Sequelize.fn('SUM', Sequelize.col('cost')), 'cost']],
    //   raw: true,
    // });

    // // SUM cost từ link
    // const linkCostResult = await Link.findOne({
    //   where: { campaignId: campaignWithAssociations?.id },
    //   attributes: [[Sequelize.fn('SUM', Sequelize.col('cost')), 'cost']],
    //   raw: true,
    // });

    // const totalCost =
    //   Number(keywordCostResult?.cost || 0) +
    //   Number(linkCostResult?.cost || 0);
    // console.log(campaignWithAssociations);
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Campaign created successfully",
      data: {
        id: campaignWithAssociations?.id,
        userId: campaignWithAssociations?.userId,
        countryId: campaignWithAssociations?.countryId,
        name: campaignWithAssociations?.name,
        campaignTypeId: campaignWithAssociations?.campaignTypeId,
        device: campaignWithAssociations?.device,
        title: campaignWithAssociations?.title,
        startDate: campaignWithAssociations?.startDate,
        endDate: campaignWithAssociations?.endDate,
        totalTraffic: totalTraffic,
        cost: totalCost,
        domain: campaignWithAssociations?.domain,
        search: campaignWithAssociations?.search,
        status: campaignWithAssociations?.status,
        keywords: campaignWithAssociations?.keywords || [],
        links: campaignWithAssociations?.links || [],
        createdAt: campaignWithAssociations?.createdAt,
        updatedAt: campaignWithAssociations?.updatedAt,
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
