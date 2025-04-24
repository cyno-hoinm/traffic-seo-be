import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getKeywordListRepo,
  createKeywordRepo,
  getKeywordByIdRepo,
  updateKeywordRepo,
} from "../../repositories/coreRepo/keyword.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { DistributionType } from "../../enums/distribution.enum";
import { ErrorType } from "../../types/Error.type";
import { baseApiPython } from "../../config/botAPI.config";

// Get keyword list with filters
export const getKeywordList = async (
  req: Request,
  res: Response<ResponseType<{ keywords: KeywordAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { campaignId, distribution, start_date, end_date, limit, page } =
      req.body;

    const filters: {
      campaignId?: number;
      distribution?: DistributionType;
      start_date?: Date;
      end_date?: Date;
      page?: number;
      limit?: number;
    } = {};
    if (page) {
      filters.page = page;
    }
    if (limit) {
      filters.limit = limit;
    }
    if (campaignId) filters.campaignId = Number(campaignId);
    if (
      distribution &&
      Object.values(DistributionType).includes(distribution as DistributionType)
    ) {
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

    const keywords = await getKeywordListRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Keywords retrieved successfully",
      data: {
        keywords: keywords.keywords.map((keyword: any) => ({
          id: keyword.id,
          campaignId: keyword.campaignId,
          name: keyword.name,
          urls: keyword.url,
          cost: keyword.cost,
          distribution: keyword.distribution,
          traffic: keyword.traffic,
          createdAt: keyword.createdAt,
          updatedAt: keyword.updatedAt,
        })),
        total: keywords.total,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching keywords",
      error: error.message,
    });
  }
};

// Create a new keyword
export const createKeyword = async (
  req: Request,
  res: Response<ResponseType<KeywordAttributes>>
): Promise<void> => {
  try {
    const { campaignId, name, urls, distribution, traffic } = req.body;

    if (
      !campaignId ||
      !name ||
      !urls ||
      !Array.isArray(urls) ||
      urls.length === 0 ||
      !distribution
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message:
          "All fields (campaignId, name, url, distribution) are required, and url must be a non-empty array",
        error: "Missing or invalid field",
      });
      return;
    }

    if (!Object.values(DistributionType).includes(distribution)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid distribution is required (DAY, MONTH, YEAR)",
        error: "Invalid field",
      });
      return;
    }
    const cost = traffic * 1; //cost per traffic
    const keyword = await createKeywordRepo({
      campaignId,
      name,
      urls,
      traffic,
      distribution,
      cost,
    });

    await baseApiPython("keyword/set", keyword);

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Keyword created successfully",
      data: {
        id: keyword.id,
        campaignId: keyword.campaignId,
        name: keyword.name,
        urls: keyword.url,
        distribution: keyword.distribution,
        traffic: keyword.traffic,
        createdAt: keyword.createdAt,
        cost: keyword.cost,
        updatedAt: keyword.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating keyword",
      error: error.message,
    });
  }
};

// Get keyword by ID
export const getKeywordById = async (
  req: Request,
  res: Response<ResponseType<KeywordAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;

    const keyword = await getKeywordByIdRepo(Number(id));
    if (!keyword) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Keyword not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Keyword retrieved successfully",
      data: {
        id: keyword.id,
        campaignId: keyword.campaignId,
        name: keyword.name,
        urls: keyword.urls,
        distribution: keyword.distribution,
        traffic: keyword.traffic,
        cost: keyword.cost,
        createdAt: keyword.createdAt,
        updatedAt: keyword.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching keyword",
      error: error.message,
    });
  }
};

export const updateKeyword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new ErrorType("ValidationError", "Invalid keyword ID", statusCode.BAD_REQUEST);
    }

    const data = req.body as Partial<{
      name: string;
      urls: string[];
      distribution: DistributionType;
      isDeleted: boolean;
    }>;

    const updatedKeyword = await updateKeywordRepo(parsedId, data);
    res.status(statusCode.OK).json(updatedKeyword);
    return;
  } catch (error: any) {
    const err = error as ErrorType;
    res.status(err.code || statusCode.INTERNAL_SERVER_ERROR).json({
      name: err.name || "InternalServerError",
      message: err.message || "An unexpected error occurred",
      code: err.code || statusCode.INTERNAL_SERVER_ERROR,
    });
    return;
  }
};
