import { LinkStatus } from "../../enums/linkStatus.enum";
import { Op } from "sequelize";
import { Link } from "../../models/index.model";

// Custom error class
class ErrorType extends Error {
  constructor(name: string, message: string, code?: string) {
    super(message);
    this.name = name;
    if (code) this.code = code;
  }
  code?: string;
}

// Get link list with filters
export const getLinkListRepo = async (filters: {
  campaignId?: number;
  status?: LinkStatus;
  start_date?: Date;
  end_date?: Date;
}): Promise<Link[]> => {
  try {
    const where: any = {};

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.status) where.status = filters.status;
    if (filters.start_date || filters.end_date) {
      where.createdAt = {};
      if (filters.start_date) where.createdAt[Op.gte] = filters.start_date;
      if (filters.end_date) where.createdAt[Op.lte] = filters.end_date;
    }

    const links = await Link.findAll({ where });
    return links;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Create a new link
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

// Get link by ID
export const getLinkByIdRepo = async (id: number): Promise<Link | null> => {
  try {
    const link = await Link.findByPk(id);
    return link;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
