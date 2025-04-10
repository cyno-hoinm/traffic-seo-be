import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getKeywordListRepo,
  createKeywordRepo,
  getKeywordByIdRepo,
} from "../../repositories/coreRepo/keyword.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { DistributionType } from "../../enums/distribution.enum";

// Get keyword list with filters
export const getKeywordList = async (
  req: Request,
  res: Response<ResponseType<KeywordAttributes[]>>
): Promise<void> => {
  try {
    const { campaignId, distribution, start_date, end_date } = req.query;

    const filters: {
      campaignId?: number;
      distribution?: DistributionType;
      start_date?: Date;
      end_date?: Date;
    } = {};

    if (campaignId) filters.campaignId = Number(campaignId);
    if (
      distribution &&
      Object.values(DistributionType).includes(distribution as DistributionType)
    ) {
      filters.distribution = distribution as DistributionType;
    } else if (distribution) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid distribution is required (EVEN, WEIGHTED, RANDOM)",
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
      data: keywords.map((keyword: KeywordAttributes) => ({
        id: keyword.id,
        campaignId: keyword.campaignId,
        name: keyword.name,
        url: keyword.url,
        distribution: keyword.distribution,
        traffic: keyword.traffic,
        createdAt: keyword.createdAt,
        updatedAt: keyword.updatedAt,
      })),
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
    const { campaignId, name, url, distribution, traffic } = req.body;

    if (
      !campaignId ||
      !name ||
      !url ||
      !Array.isArray(url) ||
      url.length === 0 ||
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
        message: "Valid distribution is required (EVEN, WEIGHTED, RANDOM)",
        error: "Invalid field",
      });
      return;
    }

    const keyword = await createKeywordRepo({
      campaignId,
      name,
      url,
      traffic,
      distribution,
    });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Keyword created successfully",
      data: {
        id: keyword.id,
        campaignId: keyword.campaignId,
        name: keyword.name,
        url: keyword.url,
        distribution: keyword.distribution,
        traffic: keyword.traffic,
        createdAt: keyword.createdAt,
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
        url: keyword.url,
        distribution: keyword.distribution,
        traffic: keyword.traffic,
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
