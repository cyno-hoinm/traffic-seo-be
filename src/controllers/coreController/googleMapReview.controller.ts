import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import {
  getGoogleMapReviewListRepo,
  createGoogleMapReviewRepo,
  getGoogleMapReviewByIdRepo,
  updateGoogleMapReviewRepo,
  getCampaignUserIdByGoogleMapReviewIdRepo,
  getGoogleMapReviewByCampaignIdRepo,
} from "../../repositories/coreRepo/googleMapReview.repository";
import { ResponseType } from "../../types/Response.type";
import { GoogleMapReviewAttributes } from "../../interfaces/GoogleMapReview.interface";
import { DistributionType } from "../../enums/distribution.enum";
import { ErrorType } from "../../types/Error.type";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { getCampaignByIdRepo } from "../../repositories/coreRepo/campagin.repository";

// Get GoogleMapReview list with filters
export const getGoogleMapReviewList = async (
  req: Request,
  res: Response<ResponseType<{ googleMapReviews: GoogleMapReviewAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { campaignId, distribution, start_date, end_date, limit, page } = req.body;

    const filters: {
      campaignId?: number;
      distribution?: DistributionType;
      start_date?: Date;
      end_date?: Date;
      page?: number;
      limit?: number;
    } = {};

    if (page) filters.page = page;
    if (limit) filters.limit = limit;
    if (campaignId) filters.campaignId = Number(campaignId);
    
    if (distribution && Object.values(DistributionType).includes(distribution as DistributionType)) {
      filters.distribution = distribution as DistributionType;
    } else if (distribution) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid distribution is required (DAY, MONTH, YEAR)",
        error: "Invalid field",
      });
      return;
    }

    if (start_date) {
      const start = new Date(start_date as string);
      if (isNaN(start.getTime())) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid start_date format",
          error: "Invalid field",
        });
        return;
      }
      filters.start_date = start;
    }

    if (end_date) {
      const end = new Date(end_date as string);
      if (isNaN(end.getTime())) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid end_date format",
          error: "Invalid field",
        });
        return;
      }
      filters.end_date = end;
    }

    const googleMapReviews = await getGoogleMapReviewListRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "GoogleMapReviews retrieved successfully",
      data: googleMapReviews,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching GoogleMapReviews",
      error: error.message,
    });
  }
};

// Create a new GoogleMapReview
export const createGoogleMapReview = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<GoogleMapReviewAttributes>>
): Promise<void> => {
  try {
    const { campaignId, content, location, googleMapUrl, imgUrls, status, cost, stars } = req.body;
    const user = req.data;

    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }

    const campaign = await getCampaignByIdRepo(campaignId);
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign Not Found",
      });
      return;
    }

    if (user.role.id === 2 && user.id !== Number(campaign.userId)) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You do not have permission",
        error: "Permission denied",
      });
      return;
    }

    if (!campaignId || !content || !location || !googleMapUrl || !imgUrls || !status || !cost || !stars) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All fields are required",
        error: "Missing required fields",
      });
      return;
    }

    const googleMapReview = await createGoogleMapReviewRepo({
      campaignId,
      content,
      location,
      googleMapUrl,
      imgUrls,
      status,
      cost,
      stars,
    });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "GoogleMapReview created successfully",
      data: googleMapReview,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating GoogleMapReview",
      error: error.message,
    });
  }
};

// Get GoogleMapReview by ID
export const getGoogleMapReviewById = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<GoogleMapReviewAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.data;

    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }

    const googleMapReview = await getGoogleMapReviewByIdRepo(Number(id));
    if (!googleMapReview) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "GoogleMapReview not found",
        error: "Resource not found",
      });
      return;
    }

    const campaign = await getCampaignByIdRepo(googleMapReview.campaignId || 0);
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign Not Found",
      });
      return;
    }

    if (user.role.id === 2 && user.id !== Number(campaign.userId)) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You do not have permission",
        error: "Permission denied",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "GoogleMapReview retrieved successfully",
      data: googleMapReview,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching GoogleMapReview",
      error: error.message,
    });
  }
};

// Update GoogleMapReview
export const updateGoogleMapReview = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<GoogleMapReviewAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.data;

    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new ErrorType(
        "ValidationError",
        "Invalid GoogleMapReview ID",
        statusCode.BAD_REQUEST
      );
    }

    const data = req.body as Partial<GoogleMapReviewAttributes>;
    const googleMapReview = await getGoogleMapReviewByIdRepo(parsedId);

    if (!googleMapReview) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "GoogleMapReview not found",
        error: "Resource not found",
      });
      return;
    }

    const campaign = await getCampaignByIdRepo(googleMapReview.campaignId || 0);
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign Not Found",
      });
      return;
    }

    if (user.role.id === 2 && user.id !== Number(campaign.userId)) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You do not have permission",
        error: "Permission denied",
      });
      return;
    }

    const updatedGoogleMapReview = await updateGoogleMapReviewRepo(parsedId, data);
    res.status(statusCode.OK).json({
      status: true,
      message: "GoogleMapReview updated successfully",
      data: updatedGoogleMapReview,
    });
  } catch (error: any) {
    const err = error as ErrorType;
    res.status(err.code || statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: err.message || "An unexpected error occurred",
      error: err.name || "InternalServerError",
    });
  }
};

// Get GoogleMapReviews by Campaign ID
export const getGoogleMapReviewsByCampaignId = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<GoogleMapReviewAttributes[]>>
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

    const { campaignId } = req.body;
    if (!campaignId || isNaN(Number(campaignId))) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid campaignId is required",
        error: "Invalid input",
      });
      return;
    }

    const campaign = await getCampaignByIdRepo(campaignId);
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign Not Found",
        error: "Campaign Not Found",
      });
      return;
    }

    if (user.role.id === 2 && user.id !== Number(campaign.userId)) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You do not have permission",
        error: "Permission denied",
      });
      return;
    }

    const googleMapReviews = await getGoogleMapReviewByCampaignIdRepo(campaignId);
    res.status(statusCode.OK).json({
      status: true,
      message: "GoogleMapReviews retrieved successfully",
      data: googleMapReviews || [],
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error retrieving GoogleMapReviews by campaignId",
      error: error.message,
    });
  }
}; 