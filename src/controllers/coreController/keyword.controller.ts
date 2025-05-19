import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getKeywordListRepo,
  createKeywordRepo,
  getKeywordByIdRepo,
  updateKeywordRepo,
  getCampaignUserIdByKeywordIdRepo,
} from "../../repositories/coreRepo/keyword.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { DistributionType } from "../../enums/distribution.enum";
import { ErrorType } from "../../types/Error.type";
import { baseApiPython, baseApiPythonUpdate } from "../../config/botAPI.config";
import { keywordStatus } from "../../enums/keywordStatus.enum";
import { formatDate } from "../../utils/utils";
import { getCampaignByIdRepo } from "../../repositories/coreRepo/campagin.repository";
import { searchLogs, searchLogsByType } from "../../services/botService/searchLog.service";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";

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
          status: keyword.status,
          cost: keyword.cost,
          timeOnSite: keyword.timeOnSite,
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
  req: AuthenticatedRequest,
  res: Response<ResponseType<KeywordAttributes>>
): Promise<void> => {
  try {
    const { campaignId, name, urls, distribution, traffic } = req.body;
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    const campaign = await getCampaignByIdRepo(campaignId)
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
        message: "You not have permission",
        error: "You not have permission",
      });
      return;
    }
    if (
      !campaignId ||
      !name ||
      !urls ||
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
      urls: JSON.stringify(urls),
      traffic,
      status: keywordStatus.ACTIVE,
      distribution,
      cost,
      timeOnSite: 1,
    });
    const dataPython = {
      keywordId: keyword.id,
      title: keyword.title,
      keyword: keyword.name,
      urls: keyword.urls,
      distribution: keyword.distribution,
      traffic: keyword.traffic || 0,
      timeOnSite: keyword.timeOnSite,
      device: keyword.device,
      domain: keyword.domain,
      timeStart: keyword.startDate,
      timeEnd: keyword.endDate,
      searchTool: keyword.search,
    };
    await baseApiPython("keyword/set", dataPython);

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Keyword created successfully",
      data: {
        id: keyword.id,
        campaignId: keyword.campaignId,
        name: keyword.name,
        urls: keyword.url,
        distribution: keyword.distribution,
        status: keyword.status,
        traffic: keyword.traffic,
        timeOnSite: keyword.timeOnSite,
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
  req: AuthenticatedRequest,
  res: Response<ResponseType<KeywordAttributes>>
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
    const keyword = await getKeywordByIdRepo(Number(id));
    if (!keyword) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Keyword not found",
        error: "Resource not found",
      });
      return;
    }
    const campaign = await getCampaignByIdRepo(keyword?.campaignId || 0)
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
        message: "You not have permission",
        error: "You not have permission",
      });
      return;
    }

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
        status: keyword.status,
        distribution: keyword.distribution,
        traffic: keyword.traffic,
        timeOnSite: keyword.timeOnSite,
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
  req: AuthenticatedRequest,
  res: Response
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
        "Invalid keyword ID",
        statusCode.BAD_REQUEST
      );
    }
    // const dataPython = {
    //   keywordId: keyword.id,
    //   timeEnd: formatDate(new Date()),
    // };
    //  baseApiPythonUpdate("keyword/update", dataPython);
    const data = req.body as Partial<{
      name: string;
      urls: string[];
      distribution: DistributionType;
      isDeleted: boolean;
      status: keywordStatus;
    }>;
    const keyword = await getKeywordByIdRepo(parsedId)
    if (!keyword) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Keyword not found",
        error: "Resource not found",
      });
      return;
    }
    const campaign = await getCampaignByIdRepo(keyword?.campaignId || 0)
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
        message: "You not have permission",
        error: "You not have permission",
      });
      return;
    }
    const updatedKeyword = await updateKeywordRepo(parsedId, data);
    if (updatedKeyword.status === keywordStatus.INACTIVE) {
      const dataPython = {
        keywordId: updatedKeyword.id,
        timeEnd: formatDate(new Date()),
      };
      baseApiPythonUpdate("keyword/update", dataPython);
    } else if (updatedKeyword.status === keywordStatus.ACTIVE) {
      const endDateKeyword = updatedKeyword.campaigns?.endDate
        ? updatedKeyword.campaigns.endDate
        : new Date();
      const dataPython = {
        keywordId: updatedKeyword.id,
        timeEnd: formatDate(endDateKeyword),
      };
      baseApiPythonUpdate("keyword/update", dataPython);
    }
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

export const getKeywordByCampaignId = async (
  req: AuthenticatedRequest ,
  res: Response<ResponseType<KeywordAttributes[]>>
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


    const campaign = await getCampaignByIdRepo(campaignId)
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign Not Found",
        error: "Campaign Not Found"
      })
      return
    }
    if (user.role.id===2 && user.id !== Number(campaign.userId)) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You not have permission",
        error: "You not have permission"
      })
      return
    }
    const filters = { campaignId: Number(campaignId) };
    const keywords = await getKeywordListRepo(filters);
    const updatedKeywords = await Promise.all(
      keywords.keywords.map(async (keyword: any) => {
        const dataPython = {
          keywordId: keyword.id,
          time_start: formatDate(campaign.startDate),
          time_end: formatDate(campaign.endDate),
        };
        const result = await baseApiPython(
          "keyword/success-count-duration",
          dataPython
        );
        const logs = await searchLogsByType({
          page: 1,
          limit: 3,
          keywordId: keyword.id,
          type: "SEARCHLOG"
        })
        return {
          id : keyword.id,
          campaignId: campaign.id ? campaign.id : null,
          name: keyword.name,
          urls: keyword.urls,
          distribution: keyword.distribution,
          cost: keyword.cost,
          isDeleted: keyword.isDeleted,
          createdAt: keyword.createdAt,
          updatedAt: keyword.updatedAt,
          status: keyword.status,
          timeOnSite: keyword.timeOnSite,
          traffic: keyword.traffic,
          trafficCompleted: result.success_count, // Corrected typo
          logs: logs
        };
      })
    );

    res.status(statusCode.OK).json({
      status: true,
      message: "Keywords retrieved successfully",
      data: updatedKeywords,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error retrieving keywords by campaignId",
      error: error.message,
    });
  }
};


export const searchLog = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<
  {
    list: {
      device: string,
      keywordId: number,
      timestamp: string,
      statusId: number
      statusName: string
    }

}>>
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
    const { page, limit, keywordId} = req.body;
    const userId = await getCampaignUserIdByKeywordIdRepo(keywordId)
    if (user.role.id === 2 && user.id !==userId) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You not have permission",
        error: "You not have permission"
      })
      return
    }
    const logs = await searchLogs(
      {
        page,
        limit,
        keywordId
      }
    )

    res.status(statusCode.OK).json({
      status: true,
      message: "Keyword retrieved successfully",
      data: {
        list: logs
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
