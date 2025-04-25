import { Op } from "sequelize";
import { sequelizeSystem } from "../../database/mySQL/config.database";
import { Campaign, Keyword, Link } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { LinkAttributes } from "../../interfaces/Link.interface";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { baseApiPython } from "../../config/botAPI.config";
import { calculateCampaignMetrics, formatDate } from "../../utils/utils";

export const getCampaignsReportUserRepo = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<
  {
    campaignId: string;
    campaignName: string;
    campaignTitle: string;
    linkCount: number;
    keywordCount: number;
    activeLink: number;
    activeKeyword: number;
  }[]
> => {
  try {
    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    // Campaign filter
    const campaignWhere: any = {
      userId,
      isDeleted: false,
    };

    // Date range filter for campaigns
    if (startDate || endDate) {
      campaignWhere[Op.and] = [];
      if (startDate) {
        campaignWhere[Op.and].push({ startDate: { [Op.gte]: startDate } });
      }
      if (endDate) {
        campaignWhere[Op.and].push({ endDate: { [Op.lte]: endDate } });
      }
    }

    const queryOptions: any = {
      where: campaignWhere,
      attributes: [
        "id",
        "name",
        "title",
        // Subquery for counting all links
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM links AS l WHERE l.campaignId = Campaign.id)`
          ),
          "linkCount",
        ],
        // Subquery for counting active (non-deleted) links
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM links AS l WHERE l.campaignId = Campaign.id AND l.status = 'ACTIVE')`
          ),
          "activeLink",
        ],
        // Subquery for counting all keywords
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM keywords AS k WHERE k.campaignId = Campaign.id)`
          ),
          "keywordCount",
        ],
        // Subquery for counting active (non-deleted) keywords
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM keywords AS k WHERE k.campaignId = Campaign.id AND k.status = 'ACTIVE')`
          ),
          "activeKeyword",
        ],
      ],
      raw: true,
    };

    const result = await Campaign.findAll(queryOptions);

    return result.map((item: any) => ({
      campaignId: item.id,
      campaignName: item.name,
      campaignTitle: item.title,
      linkCount: parseInt(item.linkCount) || 0,
      keywordCount: parseInt(item.keywordCount) || 0,
      activeLink: parseInt(item.activeLink) || 0,
      activeKeyword: parseInt(item.activeKeyword) || 0,
    }));
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export interface CampaignReport {
  campaignId: number;
  campaignName: string;
  campaignTitle: string;
  campaignDomain: string;
  startDate: Date;
  endDate: Date;
  totalTraffic: number;
  linkCount: number;
  totalCost: number;
  keywordCount: number;
  links: LinkAttributes[];
  keywords: KeywordAttributes[];
}

export const getOneCampaignReportRepo = async (
  campaignId: number
): Promise<CampaignReport | null> => {
  try {
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        status: "ACTIVE",
        isDeleted: false,
      },
      attributes: [
        "id",
        "title",
        "name",
        "startDate",
        "endDate",
        "domain",
      ],
      include: [
        {
          model: Link,
          as: "links",
          where: { isDeleted: false },
          required: false, // Include even if no links
        },
        {
          model: Keyword,
          as: "keywords",
          where: { isDeleted: false },
          required: false, // Include even if no keywords
        },
      ],
    });

    if (!campaign) {
      return null; // Campaign not found or is deleted
    }
    const keywordsCampaign = campaign.keywords || [];
    const metrics = calculateCampaignMetrics(campaign.links,campaign.keywords)
    // Post data to Python API for each keyword and collect trafficCompleted
    const updatedKeywords = await Promise.all(
      keywordsCampaign.map(async (keyword: any) => {
        const dataPython = {
          keywordId: keyword.id,
          time_start: formatDate(campaign.startDate),
          time_end: formatDate(campaign.endDate),
        };
        const result = await baseApiPython(
          "keyword/traffic-count-duration",
          dataPython
        );
        return {
          ...keyword.dataValues, // Convert Sequelize instance to plain object
          trafficCompleted: result.traffic_count, // Corrected typo
        };
      })
    );

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignTitle: campaign.title,
      campaignDomain: campaign.domain || "",
      startDate: campaign.startDate || "",
      endDate: campaign.endDate || "",
      totalCost: metrics.totalCost || 0,
      totalTraffic: metrics.totalTraffic || 0,
      linkCount: campaign.links.length,
      keywordCount: campaign.keywords.length,
      links: campaign.links || [],
      keywords: updatedKeywords, // Use updated keywords with trafficCompleted
    };
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    throw error;
  }
};

export const getCampaignsReportAllRepo = async (
  startDate?: string,
  endDate?: string
): Promise<
  {
    campaignId: string;
    campaignName: string;
    campaignTitle: string;
    linkCount: number;
    keywordCount: number;
    activeLink: number;
    activeKeyword: number;
  }[]
> => {
  try {
    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    // Campaign filter
    const campaignWhere: any = {
      isDeleted: false,
    };

    // Date range filter for campaigns
    if (startDate || endDate) {
      campaignWhere[Op.and] = [];
      if (startDate) {
        campaignWhere[Op.and].push({ startDate: { [Op.gte]: startDate } });
      }
      if (endDate) {
        campaignWhere[Op.and].push({ endDate: { [Op.lte]: endDate } });
      }
    }

    const queryOptions: any = {
      where: campaignWhere,
      attributes: [
        "id",
        "name",
        "title",
        // Subquery for counting all links
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM links AS l WHERE l.campaignId = Campaign.id)`
          ),
          "linkCount",
        ],
        // Subquery for counting active (non-deleted) links
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM links AS l WHERE l.campaignId = Campaign.id AND l.status = 'ACTIVE')`
          ),
          "activeLink",
        ],
        // Subquery for counting all keywords
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM keywords AS k WHERE k.campaignId = Campaign.id)`
          ),
          "keywordCount",
        ],
        // Subquery for counting active (non-deleted) keywords
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM keywords AS k WHERE k.campaignId = Campaign.id AND k.status = 'ACTIVE')`
          ),
          "activeKeyword",
        ],
      ],
      raw: true,
    };

    const result = await Campaign.findAll(queryOptions);

    return result.map((item: any) => ({
      campaignId: item.id,
      campaignName: item.name,
      campaignTitle: item.title,
      linkCount: parseInt(item.linkCount) || 0,
      keywordCount: parseInt(item.keywordCount) || 0,
      activeLink: parseInt(item.activeLink) || 0,
      activeKeyword: parseInt(item.activeKeyword) || 0,
    }));
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};