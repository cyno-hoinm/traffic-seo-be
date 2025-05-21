import { Request, Response } from "express";
import { getListDirectLinkByCampaignId } from "../../repositories/coreRepo/directLink.repository";
import statusCode from "../../constants/statusCode";
import { DirectLinkAttributes } from "../../interfaces/DirectLink.interface";
import { ResponseType } from "../../types/Response.type";

export const getListDirectLinkByCampaignIdController = async (
  req: Request,
  res: Response<ResponseType<DirectLinkAttributes[]>>
): Promise<void> => {
  const { id } = req.params;
  try {
    const directLink = await getListDirectLinkByCampaignId(id);
    res.status(statusCode.OK).json({
      status: true,
      message: "List direct link by campaign id",
      data: directLink,
    });
    return;
  } catch (error: any) {
    res.status(error.code || statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
    return;
  }
};
