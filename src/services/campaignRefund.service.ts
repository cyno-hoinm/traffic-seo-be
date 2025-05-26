import { Op } from "sequelize";
import { logger } from "../config/logger.config";
import cron from "node-cron";
import {
  Campaign,
  Keyword,
  Link,
  sequelizeSystem,
  TransactionModel,
  Wallet,
} from "../models/index.model";
import { CampaignStatus } from "../enums/campaign.enum";
import { keywordStatus } from "../enums/keywordStatus.enum";
import { LinkStatus } from "../enums/linkStatus.enum";
import { redisClient } from "../config/redis.config";
import { TransactionStatus } from "../enums/transactionStatus.enum";
import { TransactionType } from "../enums/transactionType.enum";
import { formatDate } from "../utils/utils";
import { baseApiPython } from "../config/botAPI.config";
import { KeywordAttributes } from "../interfaces/Keyword.interface";
import { getConfigByNameRepo } from "../repositories/commonRepo/config.repository";
import { ConfigApp } from "../constants/config.constants";
import { createNotificationRepo } from "../repositories/commonRepo/notification.repository";
import { notificationType } from "../enums/notification.enum";
import { calculateCampaignCosts } from "../controllers/coreController/campaign.controller";
import { KeywordType } from "../enums/keywordType.enum";

const QUEUE_KEY = "campaign:refund:queue";
const PROCESSED_SET_KEY = "campaign:refund:processed";

export const processCampaignRefund = async (campaignId: number) => {
  const transaction = await sequelizeSystem.transaction();

  try {
    // Fetch the campaign with keywords and links
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        { model: Keyword, as: "keywords" },
        { model: Link, as: "links" },
      ],
      transaction,
    });

    if (!campaign) {
      logger.warn(`Campaign ${campaignId} not found`);
      return;
    }

    if (
      campaign.status !== CampaignStatus.COMPLETED &&
      campaign.status !== CampaignStatus.PROCESSING
    ) {
      logger.warn(
        `Campaign ${campaignId} is not COMPLETED or PROCESSING, skipping refund`
      );
      return;
    }

    // const metrics = calculateCampaignMetrics(campaign.links, campaign.keywords);
    const { totalCost } = await calculateCampaignCosts(
      campaign.keywords,
      campaign.links,
      campaign.startDate,
      campaign.endDate
    );
    let refundAmount = 0;
    const KEYWORD_TRAFFIC_COST = await getConfigByNameRepo(
      ConfigApp.KEYWORD_TRAFFIC_COST
    );
    const KEYWORD_VIDEO_TRAFFIC_COST = await getConfigByNameRepo(
      ConfigApp.KEYWORD_VIDEO_TRAFFIC_COST
    );
    const completedTrafficPromises = campaign.keywords.map(
      async (keyword: KeywordAttributes) => {
        try {
          const dataPython = {
            keywordId: keyword.id,
            time_start: formatDate(campaign.startDate),
            time_end: formatDate(campaign.endDate),
          };
          const result = await baseApiPython(
            "keyword/success-count-duration",
            dataPython
          );
          if (keyword.keywordType === KeywordType.VIDEO) {
            return (
              result.traffic_count *
              // keyword.timeOnSite *
              Number(KEYWORD_VIDEO_TRAFFIC_COST?.value || 1)
            );
          } else {
            return (
              result.traffic_count *
              keyword.timeOnSite *
              Number(KEYWORD_TRAFFIC_COST?.value || 1)
            );
          }
        } catch (error: any) {
          logger.error(
            `Error fetching traffic for keyword ${keyword.id}: ${error.message}`
          );
          return 0;
        }
      }
    );

    const completedTraffic = await Promise.all(completedTrafficPromises);
    refundAmount = totalCost - completedTraffic[0];
    if (refundAmount > 0) {
      // Create a refund transaction
      const wallet = await Wallet.findOne({
        where: { userId: campaign.userId },
        transaction,
      });
      if (wallet) {
        await TransactionModel.create(
          {
            walletId: wallet.id,
            amount: refundAmount,
            type: TransactionType.REFUND_SERVICE,
            status: TransactionStatus.COMPLETED,
            referenceId: campaign.id.toString(),
          },
          { transaction }
        );
        await wallet.update(
          { balance: Number(wallet.balance) + Number(refundAmount) },
          { transaction }
        );
        await createNotificationRepo({
          userId: [campaign.userId],
          name: "Campaign refund",
          content: `You have been refunded ${refundAmount} credit for campaign ${campaign.name}`,
          type: notificationType.REFUND_MONEY,
        });
        logger.info(
          `Refunded ${refundAmount} to wallet ${wallet.id} for campaign ${campaignId}`
        );
      } else {
        logger.warn(
          `No wallet found for user ${campaign.userId}, skipping refund for campaign ${campaignId}`
        );
      }
    }

    // Mark campaign as processed in Redis
    await redisClient.sAdd(PROCESSED_SET_KEY, campaignId.toString());

    await transaction.commit();
    logger.info(`Processed campaign ${campaignId}: Refund ${refundAmount}`);
  } catch (error: any) {
    await transaction.rollback();
    logger.error(`Error processing campaign ${campaignId}: ${error.message}`);
    throw error;
  }
};

export const enqueueCampaignsForRefund = async (): Promise<number> => {
  let transaction;
  try {
    // Get current date without time for comparison
    const currentDate = new Date();
    currentDate.setHours(23, 0, 0, 0);

    // Start a transaction for the query
    transaction = await sequelizeSystem.transaction();

    // Find ACTIVE and CANCEL campaigns
    const campaigns = await Campaign.findAll({
      where: {
        status: {
          [Op.in]: [CampaignStatus.ACTIVE, CampaignStatus.PROCESSING],
        },
        endDate: {
          [Op.lt]: currentDate,
        },
        campaignTypeId: {
          [Op.eq]: 1 || 5,
        },
      },
      include: [{ model: Keyword, as: "keywords" }],
      transaction,
    });

    logger.info(
      `Found ${
        campaigns.length
      } campaigns to process on ${currentDate.toISOString()}`
    );

    // Process campaigns: Cancel ACTIVE campaigns, enqueue CANCEL campaigns for refund
    const campaignIds: string[] = [];
    for (const campaign of campaigns) {
      const isProcessed = await redisClient.sIsMember(
        PROCESSED_SET_KEY,
        campaign.id.toString()
      );
      if (isProcessed) {
        logger.info(`Skipping already processed campaign ${campaign.id}`);
        continue;
      }

      if (campaign.status === CampaignStatus.ACTIVE) {
        // Cancel ACTIVE campaigns
        const updateTransaction = await sequelizeSystem.transaction();
        try {
          // Update campaign status to COMPLETED
          await campaign.update(
            { status: CampaignStatus.COMPLETED },
            { transaction: updateTransaction }
          );

          // Update keywords to INACTIVE
          if (campaign.keywords && campaign.keywords.length > 0) {
            await Keyword.update(
              { status: keywordStatus.INACTIVE },
              {
                where: { campaignId: campaign.id },
                transaction: updateTransaction,
              }
            );
            logger.info(
              `Set ${campaign.keywords.length} keywords to INACTIVE for campaign ${campaign.id}`
            );
          }

          // Update links to INACTIVE
          if (campaign.links && campaign.links.length > 0) {
            await Link.update(
              { status: LinkStatus.INACTIVE },
              {
                where: { campaignId: campaign.id },
                transaction: updateTransaction,
              }
            );
            logger.info(
              `Set ${campaign.links.length} links to INACTIVE for campaign ${campaign.id}`
            );
          }
          campaignIds.push(campaign.id.toString());
          logger.info(`Completed campaign ${campaign.id}`);
          await updateTransaction.commit();
        } catch (error: any) {
          await updateTransaction.rollback();
          logger.error(
            `Error cancelling campaign ${campaign.id}: ${error.message}`
          );
          continue;
        }
      } else if (campaign.status === CampaignStatus.PROCESSING) {
        // Enqueue CANCEL campaigns for refund processing without updating status
        const updateTransaction = await sequelizeSystem.transaction();
        try {
          // Update campaign status to COMPLETED
          await campaign.update(
            { status: CampaignStatus.CANCEL },
            { transaction: updateTransaction }
          );

          // Update keywords to INACTIVE
          if (campaign.keywords && campaign.keywords.length > 0) {
            await Keyword.update(
              { status: keywordStatus.INACTIVE },
              {
                where: { campaignId: campaign.id },
                transaction: updateTransaction,
              }
            );
            logger.info(
              `Set ${campaign.keywords.length} keywords to INACTIVE for campaign ${campaign.id}`
            );
          }

          // Update links to INACTIVE
          if (campaign.links && campaign.links.length > 0) {
            await Link.update(
              { status: LinkStatus.INACTIVE },
              {
                where: { campaignId: campaign.id },
                transaction: updateTransaction,
              }
            );
            logger.info(
              `Set ${campaign.links.length} links to INACTIVE for campaign ${campaign.id}`
            );
          }
          campaignIds.push(campaign.id.toString());
          logger.info(`Completed campaign ${campaign.id}`);
          await updateTransaction.commit();
        } catch (error: any) {
          await updateTransaction.rollback();
          logger.error(
            `Error cancelling campaign ${campaign.id}: ${error.message}`
          );
          continue;
        }
        campaignIds.push(campaign.id.toString());
        logger.info(`Prepared campaign ${campaign.id} for refund enqueue`);
      }
    }

    await transaction.commit();

    // Batch enqueue campaigns to Redis
    if (campaignIds.length > 0) {
      try {
        await redisClient.lPush(QUEUE_KEY, ...campaignIds);
        logger.info(
          `Enqueued ${campaignIds.length} campaigns for refund processing`
        );
      } catch (error: any) {
        logger.error(`Failed to enqueue campaigns: ${error.message}`);
      }
    } else {
      logger.info("No campaigns to enqueue for refund");
    }

    return campaignIds.length; // Return the number of campaigns enqueued
  } catch (error: any) {
    if (transaction) {
      await transaction.rollback();
    }
    logger.error(`Error processing campaigns: ${error.message}`);
    return 0; // Return 0 to indicate no campaigns were enqueued
  }
};

export const startCampaignRefundService = async () => {
  logger.info("Starting campaign refund service...");

  // Attempt to connect to Redis once
  try {
    await redisClient.connect();
    logger.info("Successfully connected to Redis");
  } catch (error: any) {
    logger.error(`Failed to connect to Redis: ${error.message}`);
    process.exit(1); // Exit if connection fails
  }

  // Process jobs from the queue
  const processQueue = async () => {
    const isRunning = true;
    logger.info("Starting Redis queue processing for campaign refunds...");
    try {
      // Process all campaign IDs in the queue
      while (isRunning) {
        const result = await redisClient.brPop(QUEUE_KEY, 10); // Wait up to 10 seconds
        if (!result || !result.element) {
          logger.debug("No more campaigns in queue, ending processing...");
          break; // Exit loop when queue is empty
        }

        const campaignId = parseInt(result.element, 10);
        if (!isNaN(campaignId)) {
          logger.info(`Processing campaign ID ${campaignId} from queue`);
          await processCampaignRefund(campaignId);
          logger.info(`Completed processing campaign ID ${campaignId}`);
        } else {
          logger.warn(`Invalid campaign ID in queue: ${result.element}`);
        }
      }
    } catch (error: any) {
      logger.error(`Error processing queue item: ${error.message}`);
      throw error; // Rethrow to handle in cron job
    }
  };
  await enqueueCampaignsForRefund();
  await processQueue();
  // Schedule task to enqueue and process campaigns daily at midnight
  cron.schedule("0 1 * * *", async () => {
    logger.info("Running daily campaign refund check...");
    try {
      // Ensure Redis is connected
      if (!redisClient.isConnectedStatus()) {
        logger.warn(
          "Redis client is not connected. Attempting to reconnect..."
        );
        await redisClient.connect();
        logger.info("Redis client reconnected successfully");
      }

      // Enqueue campaigns
      const enqueuedCount = await enqueueCampaignsForRefund();
      logger.info(`Enqueued ${enqueuedCount} campaigns for refund processing`);

      // Process the queue immediately after enqueuing
      await processQueue();
      logger.info("Completed daily refund processing");
    } catch (error: any) {
      logger.error(`Error in daily campaign refund check: ${error.message}`);
    }
  });

  // Handle graceful shutdown
  const handleShutdown = async () => {
    logger.info("Shutting down campaign refund service...");
    try {
      if (redisClient.isConnectedStatus()) {
        await redisClient.disconnect();
        logger.info("Redis client disconnected successfully");
      }
    } catch (error: any) {
      logger.error(`Error during Redis disconnection: ${error.message}`);
    }
    process.exit(0);
  };

  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);

  logger.info(
    "Campaign refund service initialized, waiting for daily cron job..."
  );
};
