import { DirectLink } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

export const getListDirectLinkByCampaignId = async (campaignId: string) => {
  try {
    const directLink = await DirectLink.findAll({
      where: {
        campaignId,
        isDeleted: false,
      },
    });
    return directLink;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
