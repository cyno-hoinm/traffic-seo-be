import { Op } from "sequelize";
import { sequelizeSystem } from "../../database/config.database";
import { Campaign, Keyword, Link } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { LinkAttributes } from "../../interfaces/Link.interface";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";

export const getCampaignsReportUserRepo = async (
  userId: string, // Required: filter campaigns by userId
  startDate?: string, // Optional: filter campaigns by start_date
  endDate?: string // Optional: filter campaigns by end_date
): Promise<
  {
    campaignId: string;
    campaignName: string;
    linkCount: number;
    keywordCount: number;
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
        // Subquery for counting links
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM links AS l WHERE l."campaignId" = "Campaign"."id" AND l."isDeleted" = false)`
          ),
          "linkCount",
        ],
        // Subquery for counting keywords
        [
          sequelizeSystem.literal(
            `(SELECT COUNT(*) FROM keywords AS k WHERE k."campaignId" = "Campaign"."id" AND k."isDeleted" = false)`
          ),
          "keywordCount",
        ],
      ],
      raw: true,
    };

    const result = await Campaign.findAll(queryOptions);

    return result.map((item: any) => ({
      campaignId: item.id,
      campaignName: item.name,
      linkCount: parseInt(item.linkCount) || 0,
      keywordCount: parseInt(item.keywordCount) || 0,
    }));
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export interface CampaignReport {
  campaignId: number;
  campaignName: string;
  campaignDomain: string;
  startDate: Date;
  endDate: Date;
  targetTraffic: number;
  linkCount: number;
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
        status : "ACTIVE",
        isDeleted: false,
      },
      attributes: ["id", "name","startDate","endDate","totalTraffic","domain"],
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

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignDomain : campaign.domain || "",
      startDate: campaign.startDate || "",
      endDate: campaign.endDate || "",
      targetTraffic : campaign.totalTraffic || 0,
      linkCount : campaign.links.length,
      keywordCount : campaign.keywords.length,
      links: campaign.links || [],
      keywords: campaign.keywords || [],
    };
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    throw error;
  }
};
