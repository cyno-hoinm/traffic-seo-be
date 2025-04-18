import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import statusCode from "../../constants/statusCode";
import { getCampaignReport } from "../../repositories/coreRepo/campagin.repository";
import { getKeywordsByDistributionType } from "../../repositories/coreRepo/keyword.repository";
import { getLinksReport } from "../../repositories/coreRepo/link.repository";
import { getCampaignsReportUserRepo, getOneCampaignReportRepo } from "../../repositories/coreRepo/report.repository";

export const countCampaignReport = async (
  req: Request,
  res: Response<ResponseType<{ keywords: KeywordAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { key, start_date, end_date } = req.body;
    const result = await getCampaignReport(key, start_date, end_date);
    res.status(statusCode.OK).json({
      status: true,
      message: "Campaign report fetched successfully",
      data: result,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching campaign",
      error: error.message,
    });
  }
};

export const countKeyWordDistribution = async (
  req: Request,
  res: Response<ResponseType<{ keywords: KeywordAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { start_date, end_date } = req.body;
    const result = await getKeywordsByDistributionType(start_date, end_date);
    res.status(statusCode.OK).json({
      status: true,
      message: "Keyword report fetched successfully",
      data: result,
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

export const countLinksReport = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { key, start_date, end_date } = req.body;
    const result = await getLinksReport(key, start_date, end_date);
    res.status(statusCode.OK).json({
      status: true,
      message: "Keyword report fetched successfully",
      data: result,
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

export const getCampaignReportUser = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { userId, start_date, end_date } = req.body;
    const result = await getCampaignsReportUserRepo(
      userId,
      start_date,
      end_date
    );
    res.status(statusCode.OK).json({
      status: true,
      message: "Campaign report fetched successfully",
      data: result,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching campaign",
      error: error.message,
    });
  }
};


export const getOneCampaignReport = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { campaignId, start_date, end_date } = req.body;
    const result = await getOneCampaignReportRepo(
      campaignId,
      start_date,
      end_date
    );
    res.status(statusCode.OK).json({
      status: true,
      message: "Campaign report fetched successfully",
      data: result,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching campaign",
      error: error.message,
    });
  }
};

