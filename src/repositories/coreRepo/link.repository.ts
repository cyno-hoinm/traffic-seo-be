import { LinkStatus } from "../../enums/linkStatus.enum";
import { Op } from "sequelize";
import { Link } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

export const getLinkListRepo = async (filters: {
  campaignId?: number;
  status?: LinkStatus;
  start_date?: Date;
  end_date?: Date;
}): Promise<Link[]> => {
  try {
    const where: any = { isDeleted: false };

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.status) where.status = filters.status;
    if (filters.start_date || filters.end_date) {
      where.createdAt = {};
      if (filters.start_date) where.createdAt[Op.gte] = filters.start_date;
      if (filters.end_date) where.createdAt[Op.lte] = filters.end_date;
    }

    const links = await Link.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    return links;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const createLinkRepo = async (data: {
  campaignId: number;
  link: string;
  linkTo: string;
  distribution: string;
  anchorText: string;
  status: LinkStatus;
  url: string;
  page: string;
  traffic: number;
}): Promise<Link> => {
  try {
    const link = await Link.create(data);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getLinkByIdRepo = async (id: number): Promise<Link | null> => {
  try {
    const link = await Link.findByPk(id);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};