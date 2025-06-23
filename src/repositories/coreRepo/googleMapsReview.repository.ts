import { Campaign, GoogleMapReview, sequelizeSystem } from "../../models/index.model";
import { DistributionType } from "../../enums/distribution.enum";
import { Op } from "sequelize";
import { ErrorType } from "../../types/Error.type";
import { GoogleMapReviewAttributes } from "../../interfaces/GoogleMapReview.interface";
import statusCode from "../../constants/statusCode";

export const getGoogleMapReviewListRepo = async (filters: {
  campaignId?: number;
  distribution?: DistributionType;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<{ googleMapReviews: GoogleMapReviewAttributes[]; total: number }> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.distribution) where.distribution = filters.distribution;
    if (filters.start_date || filters.end_date) {
      where.createdAt = {};
      if (filters.start_date) where.createdAt[Op.gte] = filters.start_date;
      if (filters.end_date) where.createdAt[Op.lte] = filters.end_date;
    }

    const queryOptions: any = {
      where,
      order: [["createdAt", "DESC"]],
    };

    if (filters.page && filters.limit && filters.page > 0 && filters.limit > 0) {
      queryOptions.offset = (filters.page - 1) * filters.limit;
      queryOptions.limit = filters.limit;
    }

    const { rows: googleMapReviews, count: total } = await GoogleMapReview.findAndCountAll(queryOptions);

    return { googleMapReviews, total };
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createGoogleMapReviewRepo = async (data: {
  campaignId: number;
  content: string;
  location: string;
  googleMapUrl: string;
  imgUrls: string[];
  status: string;
  cost: number;
  stars: number;
}): Promise<GoogleMapReviewAttributes> => {
  try {
    const campaign = await Campaign.findByPk(data.campaignId);
    if (!campaign) {
      throw new ErrorType("NotFoundError", "Campaign not found", statusCode.NOT_FOUND);
    }

    const googleMapReview = await GoogleMapReview.create(data);
    return googleMapReview;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getGoogleMapReviewByIdRepo = async (
  id: number
): Promise<GoogleMapReviewAttributes | null> => {
  try {
    const googleMapReview = await GoogleMapReview.findByPk(id);
    return googleMapReview;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getGoogleMapReviewsByDistributionType = async (
  startDate?: string,
  endDate?: string
): Promise<{ distribution: DistributionType; count: number }[]> => {
  try {
    if (!sequelizeSystem) {
      throw new Error("Sequelize instance is not defined");
    }

    const googleMapReviewWhere: any = { isDeleted: false };

    if (startDate || endDate) {
      googleMapReviewWhere[Op.and] = [];
      if (startDate) {
        googleMapReviewWhere[Op.and].push({ createdAt: { [Op.gte]: startDate } });
      }
      if (endDate) {
        googleMapReviewWhere[Op.and].push({ createdAt: { [Op.lte]: endDate } });
      }
    }

    const queryOptions: any = {
      where: googleMapReviewWhere,
      group: ["distribution"],
      attributes: [
        "distribution",
        [sequelizeSystem.fn("COUNT", sequelizeSystem.col("distribution")), "count"],
      ],
      raw: true,
    };

    const result = await GoogleMapReview.findAll(queryOptions);
    return result.map((item: any) => ({
      distribution: item.distribution,
      count: parseInt(item.count)
    }));
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getGoogleMapReviewByCampaignIdRepo = async (
  id: number
): Promise<GoogleMapReviewAttributes[] | null> => {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorType(
        "ValidationError",
        "Campaign ID must be a positive integer",
        statusCode.BAD_REQUEST
      );
    }

    const googleMapReviews = await GoogleMapReview.findAll({
      where: { campaignId: id, isDeleted: false },
      include: [{ model: Campaign, as: 'campaigns' }]
    });

    return googleMapReviews.length > 0 ? googleMapReviews : null;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateGoogleMapReviewRepo = async (
  id: number,
  data: Partial<GoogleMapReviewAttributes>
): Promise<GoogleMapReviewAttributes> => {
  try {
    const googleMapReview = await GoogleMapReview.findByPk(id, {
      include: [{ model: Campaign, as: 'campaigns' }],
    });

    if (!googleMapReview) {
      throw new ErrorType(
        "NotFoundError",
        `GoogleMapReview with id ${id} not found`,
        statusCode.NOT_FOUND
      );
    }

    const updateData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && key !== "id" && key !== "campaignId") {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await googleMapReview.update(updateData);
    return googleMapReview;
  } catch (error: any) {
    throw new ErrorType(
      error.name,
      error.message,
      error.code || statusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const getCampaignUserIdByGoogleMapReviewIdRepo = async (
  googleMapReviewId: number
): Promise<number> => {
  try {
    const googleMapReview = await GoogleMapReview.findByPk(googleMapReviewId, {
      include: [{
        model: Campaign,
        as: "campaigns",
        attributes: ["userId"],
        where: { isDeleted: false }
      }]
    });

    if (!googleMapReview) {
      throw new ErrorType(
        "NotFoundError",
        `GoogleMapReview with id ${googleMapReviewId} not found`,
        statusCode.NOT_FOUND
      );
    }

    const plain = googleMapReview.get({ plain: true }) as any;

    if (!plain.campaigns) {
      throw new ErrorType(
        "DataError",
        `Campaign for googleMapReview ${googleMapReviewId} not found or isDeleted`,
        statusCode.NOT_FOUND
      );
    }

    return plain.campaigns.userId;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
