import { Op } from "sequelize";
import { logger } from "../config/logger.config";
import cron from "node-cron";
import { Campaign, DirectLink, Keyword, Link, sequelizeSystem } from "../models/index.model";
import { CampaignStatus } from "../enums/campaign.enum";
import { keywordStatus } from "../enums/keywordStatus.enum";
import { LinkStatus } from "../enums/linkStatus.enum";
import { createNotificationRepo } from "../repositories/commonRepo/notification.repository";
import { notificationType } from "../enums/notification.enum";

export const checkAndUpdateCampaignStatus = async () => {
  logger.info("Running campaign status check...");

  const transaction = await sequelizeSystem.transaction();

  try {
    // Get current date without time for comparison (to match startDate)
    const currentDate = new Date();
    currentDate.setHours(8, 0, 0, 0);

    // Find campaigns with NOT_STARTED status and startDate <= currentDate
    const campaigns = await Campaign.findAll({
      where: {
        status: CampaignStatus.NOT_STARTED,
        startDate: {
          [Op.lte]: currentDate,
        },
      },
      transaction,
    });
    
    logger.info(`Found ${campaigns.length} campaigns to update`);

    for (const campaign of campaigns) {
      // Update campaign status to ACTIVE
      await campaign.update(
        { status: CampaignStatus.ACTIVE },
        { transaction }
      );

      // Update associated keywords to ACTIVE
      await Keyword.update(
        { status: keywordStatus.ACTIVE },
        {
          where: {
            campaignId: campaign.id,
            status: keywordStatus.INACTIVE, // Only update INACTIVE keywords
          },
          transaction,
        }
      );

      // Update associated links to ACTIVE
      await Link.update(
        { status: LinkStatus.ACTIVE },
        {
          where: {
            campaignId: campaign.id,
            status: LinkStatus.INACTIVE, // Only update INACTIVE links
          },
          transaction,
        }
      );
      await DirectLink.update(
        { status: LinkStatus.ACTIVE },
        {
          where: {
            campaignId: campaign.id,
            status: LinkStatus.INACTIVE, // Only update INACTIVE links
          },
          transaction,
        }
      );
      // Send notification for campaign status change
      await createNotificationRepo({
        userId: [campaign.userId],
        name: campaign.name,
        content: `Campaign ${campaign.name} is now running`,
        type: notificationType.RUNNING_CAMPAIGN,
      });


      logger.info(`Updated campaign ${campaign.id} and its keywords/links to ACTIVE`);
    }

    await transaction.commit();
    logger.info("Campaign status check completed successfully");
  } catch (error: any) {
    await transaction.rollback();
    logger.error("Error during campaign status check:", error.message);
    throw error; // Re-throw to allow caller to handle
  }
};

export const startCampaignStatusService = async () => {
  logger.info("Starting campaign status service...");
  await checkAndUpdateCampaignStatus()
  // Schedule the task to run every day at 1 AM
  cron.schedule("0 0 * * *", async () => {
    try {
      await checkAndUpdateCampaignStatus();
    } catch (error: any) {
      // Error is already logged in checkAndUpdateCampaignStatus
      // Additional handling can be added here if needed
      logger.error("Error during campaign status check:", error.message);
      throw error; // Re-throw to allow caller to handle
    }
  });
};