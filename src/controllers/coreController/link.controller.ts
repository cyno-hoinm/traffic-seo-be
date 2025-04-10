import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getLinkListRepo,
  createLinkRepo,
  getLinkByIdRepo,
} from "../../repositories/coreRepo/link.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { LinkAttributes } from "../../interfaces/Link.interface";
import { LinkStatus } from "../../enums/linkStatus.enum";

// Get link list with filters
export const getLinkList = async (
  req: Request,
  res: Response<ResponseType<LinkAttributes[]>>
): Promise<void> => {
  try {
    const { campaignId, status, start_date, end_date } = req.query;

    const filters: {
      campaignId?: number;
      status?: LinkStatus;
      start_date?: Date;
      end_date?: Date;
    } = {};

    if (campaignId) filters.campaignId = Number(campaignId);
    if (status && Object.values(LinkStatus).includes(status as LinkStatus)) {
      filters.status = status as LinkStatus;
    } else if (status) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (ACTIVE, INACTIVE, PENDING)",
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

    const links = await getLinkListRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Links retrieved successfully",
      data: links.map((link: LinkAttributes) => ({
        id: link.id,
        campaignId: link.campaignId,
        link: link.link,
        linkTo: link.linkTo,
        distribution: link.distribution,
        traffic: link.traffic,
        anchorText: link.anchorText,
        status: link.status,
        url: link.url,
        page: link.page,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching links",
      error: error.message,
    });
  }
};

// Create a new link
export const createLink = async (
  req: Request,
  res: Response<ResponseType<LinkAttributes>>
): Promise<void> => {
  try {
    const {
      campaignId,
      link,
      linkTo,
      distribution,
      anchorText,
      status,
      url,
      page,
      traffic,
    } = req.body;

    if (
      !campaignId ||
      !link ||
      !linkTo ||
      !distribution ||
      !anchorText ||
      !status ||
      !url ||
      !page
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message:
          "All fields (campaignId, link, linkTo, distribution, anchorText, status, url, page) are required",
        error: "Missing or invalid field",
      });
      return;
    }

    if (!Object.values(LinkStatus).includes(status)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (ACTIVE, INACTIVE, PENDING)",
        error: "Invalid field",
      });
      return;
    }

    const newLink = await createLinkRepo({
      campaignId,
      link,
      linkTo,
      distribution,
      anchorText,
      status,
      url,
      page,
      traffic,
    });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Link created successfully",
      data: {
        id: newLink.id,
        campaignId: newLink.campaignId,
        link: newLink.link,
        linkTo: newLink.linkTo,
        distribution: newLink.distribution,
        traffic: newLink.traffic,
        anchorText: newLink.anchorText,
        status: newLink.status,
        url: newLink.url,
        page: newLink.page,
        createdAt: newLink.createdAt,
        updatedAt: newLink.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating link",
      error: error.message,
    });
  }
};

// Get link by ID
export const getLinkById = async (
  req: Request,
  res: Response<ResponseType<LinkAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;

    const link = await getLinkByIdRepo(Number(id));
    if (!link) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Link not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Link retrieved successfully",
      data: {
        id: link.id,
        campaignId: link.campaignId,
        link: link.link,
        linkTo: link.linkTo,
        distribution: link.distribution,
        traffic: link.traffic,
        anchorText: link.anchorText,
        status: link.status,
        url: link.url,
        page: link.page,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching link",
      error: error.message,
    });
  }
};
