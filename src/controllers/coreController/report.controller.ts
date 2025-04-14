import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import { KeywordAttributes } from "../../interfaces/Keyword.interface";
import { DistributionType } from "../../enums/distribution.enum";
import statusCode from "../../constants/statusCode";
import { getCampaignReport } from "../../repositories/coreRepo/campagin.repository";

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
      message: "Error fetching keywords",
      error: error.message,
    });
  }
};
