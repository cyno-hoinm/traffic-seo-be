import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  getLinkListRepo,
  createLinkRepo,
  getLinkByIdRepo,
  updateLinkRepo,
  getLinkByCampaignIdRepo,
} from "../../repositories/coreRepo/link.repository"; // Adjust path
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { LinkAttributes } from "../../interfaces/Link.interface";
import { LinkStatus } from "../../enums/linkStatus.enum";
import { ErrorType } from "../../types/Error.type";
import { DistributionType } from "../../enums/distribution.enum";
import { searchLogsByType } from "../../services/botService/searchLog.service";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";
import { getCampaignByIdRepo } from "../../repositories/coreRepo/campagin.repository";
import { URL } from "url";
import puppeteer, { Browser } from "puppeteer";


// Get link list with filters
export const getLinkList = async (
  req: Request,
  res: Response<ResponseType<{ links: LinkAttributes[]; total: number }>>
): Promise<void> => {
  try {
    const { campaignId, status, start_date, end_date, page, limit } = req.body;

    const filters: {
      campaignId?: number;
      status?: LinkStatus;
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

    const result = await getLinkListRepo(filters);
    res.status(statusCode.OK).json({
      status: true,
      message: "Links retrieved successfully",
      data: {
        links: result.links.map((link: LinkAttributes) => ({
          id: link.id,
          campaignId: link.campaignId,
          link: link.link,
          linkTo: link.linkTo,
          distribution: link.distribution,
          traffic: link.traffic,
          anchorText: link.anchorText,
          status: link.status,
          url: link.url,
          cost: link.cost,
          page: link.page,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        })),
        total: result.total,
      },
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
  req: AuthenticatedRequest,
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
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    const campaign = await getCampaignByIdRepo(campaignId);
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

    const cost = traffic * 1;
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
      cost,
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
        cost: newLink.cost,
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
  req: AuthenticatedRequest,
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
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    const campaign = await getCampaignByIdRepo(link?.campaignId || 0);
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
        cost: link.cost,
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

export const updateLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new ErrorType(
        "ValidationError",
        "Invalid link ID",
        statusCode.BAD_REQUEST
      );
    }

    const data = req.body as Partial<{
      link: string;
      linkTo: string;
      distribution: DistributionType;
      anchorText: string;
      status: LinkStatus;
      url: string;
      page: string;
      isDeleted: boolean;
    }>;
    const link = await getLinkByIdRepo(parsedId);
    if (!link) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Link not found",
        error: "Resource not found",
      });
      return;
    }
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    const campaign = await getCampaignByIdRepo(link?.campaignId || 0);
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
    const updatedLink = await updateLinkRepo(parsedId, data);
    res.status(statusCode.OK).json(updatedLink);
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

export const getLinkByCampaignId = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any[]>>
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

    const { id } = req.params;
    const campaign = await getCampaignByIdRepo(Number(id));
    if (!campaign) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Campaign Not Found",
        error: "Campaign Not Found",
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

    const links = await getLinkByCampaignIdRepo(Number(id));
    if (!links) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Link not found",
        error: "Resource not found",
      });
      return;
    }

    const updateLinks = await Promise.all(
      links.links.map(async (link: any) => {
        const logs = await searchLogsByType({
          page: 1,
          limit: 3,
          linkId: link.id,
          type: "DIRECTLOG",
        });
        return {
          id: link.id,
          campaignId: campaign.id,
          link: link.link,
          distribution: link.distribution || null,
          cost: link.cost,
          isDeleted: link.isDeleted,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
          status: link.status,
          logs: logs,
        };
      })
    );

    res.status(statusCode.OK).json({
      status: true,
      message: "Link retrieved successfully",
      data: updateLinks,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching link",
      error: error.message,
    });
    return;
  }
};

export const checkUrlIndexing = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<any>>
): Promise<void> => {
  let browser: Browser | null = null;
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
       res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "URLs array is required",
        error: "Missing field",
      });
      return;
    }

    // Validate URL format
    const parsedUrls: URL[] = [];
    try {
      for (const url of urls) {
        parsedUrls.push(new URL(url));
      }
    } catch {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid URL format in array",
        error: "Invalid field",
      });
      return;
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-infobars',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      ]
    });

    const checkUrl = async (parsedUrl: URL) => {
      const page = await browser!.newPage();

      try {
        // Override navigator.webdriver
        await page.evaluateOnNewDocument(() => {
          // @ts-ignore
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
        });

        // Set headers
        await page.setExtraHTTPHeaders({
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
        });

        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to Google and search
        const searchQuery = `site:${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`;
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000,
        });

        // Extract results
        const searchResults = await page.evaluate(() => {
          interface SearchResult {
            title: string;
            link: string;
          }
          const results: SearchResult[] = [];
          // @ts-ignore
          const elements = document.querySelectorAll('div[role="main"] h3');
          // @ts-ignore
          const links = document.querySelectorAll('div[role="main"] a');

          for (let i = 0; i < Math.min(elements.length, links.length); i++) {
            const title = elements[i]?.textContent?.trim() || '';
            // @ts-ignore
            const link = links[i]?.href || '';
            if (title && link) {
              results.push({ title, link });
            }
          }
          return results;
        });

        const inputHost = parsedUrl.hostname.replace(/^www\./, '');
        const isIndexed = searchResults.some((result: any) => {
          try {
            const resultHost = new URL(result.link).hostname.replace(/^www\./, '');
            return resultHost === inputHost;
          } catch {
            return false;
          }
        });

        return {
          url: parsedUrl.toString(),
          isIndexed,
          searchResults: searchResults.slice(0, 5),
          lastChecked: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error checking URL ${parsedUrl.toString()}:`, error);
        return {
          url: parsedUrl.toString(),
          isIndexed: false,
          error: (error as Error).message,
          lastChecked: new Date().toISOString(),
        };
      } finally {
        await page.close();
      }
    };

    // Process URLs in parallel with limited concurrency
    const results = await Promise.all(
      parsedUrls.map(url => checkUrl(url))
    );

    await browser.close();
    browser = null;

    res.status(statusCode.OK).json({
      status: true,
      message: "URLs indexing status checked successfully",
      data: {
        results,
        summary: {
          totalUrls: results.length,
          indexedUrls: results.filter(r => r.isIndexed).length,
          notIndexedUrls: results.filter(r => !r.isIndexed).length,
        },
      },
    });
  } catch (error: any) {
    if (browser) await browser.close();
    console.error('Error in checkUrlIndexing:', error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error checking URLs indexing status",
      error: error.message,
    });
  }
};