import { Request, Response } from "express";
import statusCode from "../../constants/statusCode"; // Adjust path
import {
  createTransactionRepo,
  getListTransactionRepo,
  getTransactionByIdRepo,
} from "../../repositories/moneyRepo/transaction.repository";
import { ResponseType } from "../../types/Response.type"; // Adjust path
import { TransactionAttributes } from "../../interfaces/Transaction.interface";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { TransactionType } from "../../enums/transactionType.enum";
import { getCampaignByIdRepo } from "../../repositories/coreRepo/campagin.repository";
import { calculateCampaignMetrics } from "../../utils/utils";

// Create a new transaction
export const createTransaction = async (
  req: Request,
  res: Response<ResponseType<TransactionAttributes>>
): Promise<void> => {
  try {
    const { walletId, amount, status, type } = req.body;

    if (!walletId || amount === undefined || isNaN(amount) || !status) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "All fields (walletId, amount, status) are required",
        error: "Missing or invalid field",
      });
      return;
    }

    const transaction = await createTransactionRepo({
      walletId,
      amount,
      status,
      type,
    });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Transaction created successfully",
      data: {
        id: transaction.id,
        walletId: transaction.walletId,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.type,
        referenceId: transaction.referenceId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

export const getListTransaction = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { walletId, status, start_date, end_date, page, limit, type } =
      req.body;

    const filters: {
      walletId?: number;
      status?: TransactionStatus;
      type?: TransactionType;
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
    if (walletId) filters.walletId = Number(walletId);
    if (status) {
      if (
        ![
          TransactionStatus.COMPLETED,
          TransactionStatus.FAILED,
          TransactionStatus.PENDING,
        ].includes(status as TransactionStatus)
      ) {
        res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid status is required (COMPLETED, FAILED, PENDING)",
          error: "Invalid field",
        });
        return;
      }
      filters.status = status as TransactionStatus;
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
    if (type) {
      filters.type = type;
    }

    const transactions = await getListTransactionRepo(filters);

    // Fetch campaign details for each PAY_SERVICE transaction
    const transactionWithCampaigns = await Promise.all(
      transactions.map(async (transaction: TransactionAttributes) => {
        let campaign = null;
        if (transaction.type === TransactionType.PAY_SERVICE && transaction.referenceId) {
          campaign = await getCampaignByIdRepo(parseInt(transaction.referenceId));
        }
        return {
          id: transaction.id,
          walletId: transaction.walletId,
          username: transaction.wallet?.users?.username,
          campaignName: campaign ? campaign.name : null, // Include campaign name or null if not applicable
          amount: transaction.amount,
          status: transaction.status,
          type: transaction.type,
          referenceId: transaction.referenceId,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        };
      })
    );

    res.status(statusCode.OK).json({
      status: true,
      message: "Transactions retrieved successfully",
      data: {
        transaction: transactionWithCampaigns,
        total: transactions.length,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

export const getOneTransaction = async (
  req: Request,
  res: Response<ResponseType<TransactionAttributes>>
): Promise<void> => {
  try {
    const { transactionId } = req.body;
    const transaction = await getTransactionByIdRepo(transactionId);
    if (transaction.type === TransactionType.PAY_SERVICE) {
      const campaign = await getCampaignByIdRepo(
        Number(transaction.referenceId)
      );
      if (!campaign) {
        res.status(statusCode.OK).json({
          status: true,
          message:
            "Transactions retrieved successfully, this transaction do not have campaign",
          data: transaction,
        });
        return;
      }
      // Calculate total traffic and cost from links and keywords
      const metrics = calculateCampaignMetrics(
        campaign.links,
        campaign.keywords
      );
      res.status(statusCode.OK).json({
        status: true,
        message: "Transactions retrieved successfully",
        data: {
          ...transaction,
          campaign: {
            id: campaign.id,
            userId: campaign.userId,
            countryId: campaign.countryId,
            name: campaign.name,
            campaignTypeId: campaign.campaignTypeId,
            device: campaign.device,
            title: campaign.title,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            totalTraffic: metrics.totalTraffic,
            totalCost: metrics.totalCost,
            links : campaign.links,
            keywords : campaign.keywords,
            domain: campaign.domain,
            search: campaign.search,
            status: campaign.status,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
          },
        },
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Transactions retrieved successfully",
      data: transaction,
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching transactions",
      error: error.message,
    });
    return;
  }
};
