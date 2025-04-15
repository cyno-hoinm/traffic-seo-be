import { Response } from "express";
import statusCode from "../../constants/statusCode";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { ResponseType } from "../../types/Response.type";
import { getKeywordByCampaignIdRepo } from "../../repositories/coreRepo/keyword.repository";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";

export const getKeywordByCampaignId = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<KeywordAttributes>>
): Promise<void> => {
  try {
    const { campaignId } = req.body;
    const parsedCampaignId = Number(campaignId);

    const keywords = await getKeywordByCampaignIdRepo(parsedCampaignId);
    if (!keywords) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Keywords not found",
        error: "Not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Keywords retrieved successfully",
      data: keywords,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching keywords",
      error: error.message,
    });
  }
};
