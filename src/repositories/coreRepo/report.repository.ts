import { Op } from "sequelize";
import { sequelizeSystem } from "../../database/mySQL/config.database";
import { Campaign, DirectLink, Keyword, Link } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { LinkAttributes } from "../../interfaces/Link.interface";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { DirectLinkAttributes } from "../../interfaces/DirectLink.interface";
import { baseApiPython } from "../../config/botAPI.config";
import {
  calculateCampaignMetrics,
  formatDate,
  formatInTheEndDate,
  getDateRange,
} from "../../utils/utils";
import { logger } from "../../config/logger.config";
export const getCampaignsReportUserRepo = async (
  userId: string,
  campaignTypeId?: number,
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
    if (campaignTypeId) {
      campaignWhere.campaignTypeId = campaignTypeId;
    }
    // Date range filter for campaigns
    if (startDate || endDate) {
      campaignWhere[Op.and] = [];
      // if (startDate) {
      //   campaignWhere[Op.and].push({ startDate: { [Op.gte]: startDate } });
      // }
      // if (endDate) {
      //   campaignWhere[Op.and].push({ endDate: { [Op.lte]: endDate } });
      // }
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

    const campaigns = await Campaign.findAll(queryOptions);

    const result = await Promise.all(
      campaigns.map(async (campaign: any) => {
        // Fetch active keywords for the campaign
        const keywords = await sequelizeSystem.models.Keyword.findAll({
          where: { campaignId: campaign.id },
          attributes: ["id"],
          raw: true,
        });
        const keywordIds: { id: string }[] = keywords.map((keyword: any) => ({
          id: keyword.id,
        }));

        // Fetch active direct links for the campaign
        const directLinks = await sequelizeSystem.models.DirectLink.findAll({
          where: { campaignId: campaign.id },
          attributes: ["id"],
          raw: true,
        });
        const directLinkIds: { id: string }[] = directLinks.map((directLink: any) => ({
          id: directLink.id,
        }));

        let traffic: { date: string; traffic: number }[] = [];

        if (startDate && endDate && keywords.length > 0) {
          traffic = await calculateTraffic(startDate, endDate, keywordIds, undefined);
        } else if (startDate && endDate && directLinks.length > 0) {
          traffic = await calculateTraffic(startDate, endDate, undefined, directLinkIds);
        }

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignTitle: campaign.title,
          linkCount: parseInt(campaign.linkCount) || 0,
          keywordCount: parseInt(campaign.keywordCount) || 0,
          activeLink: parseInt(campaign.activeLink) || 0,
          activeKeyword: parseInt(campaign.activeKeyword) || 0,
          traffic,
        };
      })
    );

    return result;
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
  directLinkCount: number;
  links: LinkAttributes[];
  keywords: KeywordAttributes[];
  directLinks: DirectLinkAttributes[];
  traffic: any;
}

export const getOneCampaignReportRepo = async (
  campaignId: number
): Promise<CampaignReport | null> => {
  const campaign = await Campaign.findOne({
    where: {
      id: campaignId,
      isDeleted: false,
    },
    attributes: ["id", "title", "name", "startDate", "endDate", "domain"],
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
      {
        model: DirectLink,
        as: "directLinks",
        where: { isDeleted: false },
        required: false,
      },
    ],
  });

  if (!campaign) {
    return null; // Campaign not found or is deleted
  }

  const keywordsCampaign = campaign.keywords || [];
  const directLinksCampaign = campaign.directLinks || [];
  const metrics = calculateCampaignMetrics(campaign.links, campaign.keywords);

  // Post data to Python API for each keyword and collect trafficCompleted
  const updatedKeywords = await Promise.all(
    keywordsCampaign.map(async (keyword: any) => {
      const dataPython = {
        keywordId: keyword.id,
        time_start: formatDate(campaign.startDate),
        time_end: formatDate(campaign.endDate),
      };
      const result = await baseApiPython(
        "keyword/success-count-duration",
        dataPython
      );
      return {
        id: keyword.id,
        campaignId: campaign.id,
        name: keyword.name,
        urls: keyword.urls,
        distribution: keyword.distribution,
        cost: keyword.cost,
        isDeleted: keyword.isDeleted,
        createdAt: keyword.createdAt,
        updatedAt: keyword.updatedAt,
        timeOnSite: keyword.timeOnSite,
        keywordType: keyword.keywordType,
        status: keyword.status,
        traffic: keyword.traffic,
        trafficCompleted: result.success_count,
      };
    })
  );

  // Post data to Python API for each direct link and collect trafficCompleted
  const updatedDirectLinks = await Promise.all(
    directLinksCampaign.map(async (directLink: any) => {
      const dataPython = {
        directLinkId: directLink.id,
        time_start: formatDate(campaign.startDate),
        time_end: formatDate(campaign.endDate),
      };
      const result = await baseApiPython(
        "direct-link/success-count-duration",
        dataPython
      );
      return {
        id: directLink.id,
        campaignId: campaign.id,
        link: directLink.link,
        distribution: directLink.distribution,
        cost: directLink.cost,
        isDeleted: directLink.isDeleted,
        createdAt: directLink.createdAt,
        updatedAt: directLink.updatedAt,
        timeOnSite: directLink.timeOnSite,
        status: directLink.status,
        traffic: directLink.traffic,
        trafficCompleted: result.success_count,
      };
    })
  );

  const keywordIds: { id: string }[] = keywordsCampaign.map((keyword: any) => ({
    id: keyword.id,
  }));
  const directLinkIds: { id: string }[] = directLinksCampaign.map((directLink: any) => ({
    id: directLink.id,
  }));
  let traffic: { date: string; traffic: number }[] = [];

  if (campaign.startDate && campaign.endDate) {
    if (keywordsCampaign.length > 0) {
      traffic = await calculateTraffic(
        formatDate(campaign.startDate.toISOString()),
        formatInTheEndDate(campaign.endDate.toISOString()),
        keywordIds,
        undefined
      );
    } else if (directLinksCampaign.length > 0) {
      traffic = await calculateTraffic(
        formatDate(campaign.startDate.toISOString()),
        formatInTheEndDate(campaign.endDate.toISOString()),
        undefined,
        directLinkIds
      );
    }
  }

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
    directLinkCount: campaign.directLinks.length,
    links: campaign.links || [],
    keywords: updatedKeywords,
    directLinks: updatedDirectLinks,
    traffic,
  };
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
    traffic: {
      date: string; // ISO string, e.g., 2025-04-24T23:59:59Z
      traffic: number;
    }[];
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

    const campaigns = await Campaign.findAll(queryOptions);

    // Fetch keywords and traffic for each campaign
    const result = await Promise.all(
      campaigns.map(async (campaign: any) => {
        // Fetch active keywords for the campaign
        const keywords = await sequelizeSystem.models.Keyword.findAll({
          where: { campaignId: campaign.id },
          attributes: ["id"],
          raw: true,
        });
        const keywordIds: { id: string }[] = keywords.map((keyword: any) => ({
          id: keyword.id,
        }));
        let traffic: { date: string; traffic: number }[] = [];

        if (startDate && endDate && keywords.length > 0) {
          traffic = await calculateTraffic(startDate, endDate, keywordIds);
        }

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignTitle: campaign.title,
          linkCount: parseInt(campaign.linkCount) || 0,
          keywordCount: parseInt(campaign.keywordCount) || 0,
          activeLink: parseInt(campaign.activeLink) || 0,
          activeKeyword: parseInt(campaign.activeKeyword) || 0,
          traffic,
        };
      })
    );

    return result;
  } catch (error: any) {
    throw new ErrorType(
      error.name || "DatabaseError",
      error.message || "Failed to fetch campaign reports",
      error.code || 500
    );
  }
};

const calculateTraffic = async (
  startDate: string,
  endDate: string,
  keywords?: { id: string }[],
  directLinks?: { id: string }[]
): Promise<{ date: string; traffic: number }[]> => {
  const currentDate = formatInTheEndDate(new Date());

  // Use current date if endDate is in the future
  const effectiveEndDate =
    new Date(endDate) > new Date(currentDate) ? currentDate : endDate;

  const dateRange = getDateRange(startDate, effectiveEndDate);
  const trafficByDate: { [key: string]: number } = {};

  // Initialize traffic aggregation
  dateRange.forEach((date) => {
    trafficByDate[date] = 0;
  });

  // Fetch traffic data for each date and keyword
  if (keywords) {
    for (const date of dateRange) {
      const dailyTrafficData = await Promise.all(
        keywords.map(async (keyword: any) => {
          const dataPython = {
            keywordId: keyword.id,
            time_start: formatDate(date),
            time_end: formatInTheEndDate(date),
          };
          try {
            const result = await baseApiPython(
              "keyword/success-count-duration",
              dataPython
            );
            return {
              date,
              traffic: Number(result.success_count) || 0,
            };
          } catch (apiError) {
            logger.error("Error fetching traffic data:", apiError);
            return { date, traffic: 0 };
          }
        })
      );

      // Aggregate traffic for this date
      dailyTrafficData.forEach((data) => {
        trafficByDate[data.date] += data.traffic;
      });
    }
  } else if (directLinks) {
    for (const date of dateRange) {
      const dailyTrafficData = await Promise.all(
        directLinks.map(async (directLink: any) => {
          const dataPython = {
            directLinkId: directLink.id,
            time_start: formatDate(date),
            time_end: formatInTheEndDate(date),
          };
          try {
            const result = await baseApiPython(
              "direct-link/success-count-duration",
              dataPython
            );
            return {
              date,
              traffic: Number(result.success_count) || 0,
            };
          } catch (apiError) {
            logger.error("Error fetching traffic data:", apiError);
            return { date, traffic: 0 };
          }
        })
      );

      // Aggregate traffic for this date
      dailyTrafficData.forEach((data) => {
        trafficByDate[data.date] += data.traffic;
      });
    }
  }

  return dateRange.map((date) => ({
    date,
    traffic: trafficByDate[date] || 0,
  }));
};
