import { Op } from "sequelize";
import { sequelizeSystem } from "../../database/config.database";
import { Campaign } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

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

export const getOneCampaignReportRepo = async (
  campaignId: number, // Required: filter by campaignId
  startDate?: string, // Optional: filter campaign by startDate
  endDate?: string // Optional: filter campaign by endDate
): Promise<{
  campaignId: number;
  campaignName: string;
  linkCount: number;
  keywordCount: number;
}> => {
  try {
    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    // Campaign filter
    const campaignWhere: any = {
      id: campaignId,
      isDeleted: false,
    };

    // Date range filter for campaign
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

    const result = await Campaign.findOne(queryOptions);

    if (!result) {
      return {
        campaignId: -1,
        campaignName: "",
        linkCount: 0,
        keywordCount: 0,
      };
    }

    return {
      campaignId: result.id,
      campaignName: result.name,
      linkCount: result.keywordsCount || 0,
      keywordCount: result.keywordsCount || 0,
    };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
