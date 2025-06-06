import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import statusCode from "../../constants/statusCode";
import {  getCampaignReport, isCampaignOwnerRepo } from "../../repositories/coreRepo/campagin.repository";
import { getKeywordsByDistributionType } from "../../repositories/coreRepo/keyword.repository";
import { getLinksReport } from "../../repositories/coreRepo/link.repository";
import {
  CampaignReport,
  getCampaignsReportAllRepo,
  getCampaignsReportUserRepo,
  getOneCampaignReportRepo,
} from "../../repositories/coreRepo/report.repository";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { CampaignReportList } from "../../interfaces/CampaignReport.interface";

export const countCampaignReport = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<CampaignReportList>>
): Promise<void> => {
  try {
    const { status, start_date, end_date } = req.body;
    const userId = req.data?.id;

    const roleUser = req.data?.role.id;
    let result;
    if (roleUser === 1) {
      result = await getCampaignReport(status, start_date, end_date);
    } else if (roleUser === 2) {
      result = await getCampaignReport(status, start_date, end_date, userId);
    }

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
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { userId, start_date, end_date, campaignTypeId } = req.body;
    const result = await getCampaignsReportUserRepo(
      userId,
      campaignTypeId,
      start_date,
      end_date
    );
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    if (user.role.id === 2 && user.id !== Number(userId)) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You not have permission",
        error: "You not have permission",
      });
      return;
    }
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
export const getCampaignReportAll = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { start_date, end_date } = req.body;
    const result = await getCampaignsReportAllRepo(
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
  req: AuthenticatedRequest,
  res: Response<ResponseType<CampaignReport>>
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
    const isOwner = await isCampaignOwnerRepo({
      campaignId, userId: user.id
    })
    if (user.role.id===2 && !isOwner) {
      res.status(statusCode.FORBIDDEN).json({
        status: false,
        message: "You not have permission",
        error: "You not have permission",
      })
      return
    }

    const result = await getOneCampaignReportRepo(
      campaignId
    );

    res.status(statusCode.OK).json({
      status: true,
      message: "Campaign report fetched successfully",
      data: result || undefined,
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
