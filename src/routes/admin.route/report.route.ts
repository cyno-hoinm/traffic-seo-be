import express from "express";
import { countCampaignReport, countKeyWordDistribution, countLinksReport, getCampaignReportUser, getOneCampaignReport } from "../../controllers/coreController/report.controller";
import { authorization } from "../../middleware/auth";
const router = express.Router();
/**
 * @swagger
 * /report/campaign-report:
 *   post:
 *     summary: Fetch campaign report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - start_date
 *               - end_date
 *             properties:
 *               key:
 *                 type: string
 *                 description: The key for the campaign
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for the report
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date for the report
 *     responses:
 *       200:
 *         description: Campaign report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     keywords:
 *                       type: array
 *                       items:
 *                         type: object
 *                         additionalProperties: true
 *                     total:
 *                       type: number
 *       500:
 *         description: Error fetching campaign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post("/campaign-report", authorization(["read-report"]), countCampaignReport);
/**
 * @swagger
 * /report/keyword-distribution:
 *   post:
 *     summary: Fetch keyword distribution report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for the report
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date for the report
 *     responses:
 *       200:
 *         description: Keyword report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     keywords:
 *                       type: array
 *                       items:
 *                         type: object
 *                         additionalProperties: true
 *                     total:
 *                       type: number
 *       500:
 *         description: Error fetching keywords
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post("/keyword-distribution",authorization(["read-report"]), countKeyWordDistribution);
/**
 * @swagger
 * /report/links-report:
 *   post:
 *     summary: Fetch links report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - start_date
 *               - end_date
 *             properties:
 *               key:
 *                 type: string
 *                 description: The key for the links report
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for the report
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date for the report
 *     responses:
 *       200:
 *         description: Keyword report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       500:
 *         description: Error fetching keywords
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post("/links-report", authorization(["read-report"]), countLinksReport);
/**
 * @swagger
 * /report/campaigns-report/user:
 *   post:
 *     summary: Fetch campaign reports for a user
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Unique identifier of the user to filter campaigns
 *                 example: "user456"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Optional start date to filter campaigns (inclusive)
 *                 example: "2025-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Optional end date to filter campaigns (inclusive)
 *                 example: "2025-12-31"
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Successfully fetched campaign reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Descriptive message about the response
 *                   example: "Campaign report fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       campaignId:
 *                         type: string
 *                         description: Unique identifier of the campaign
 *                         example: "123"
 *                       campaignName:
 *                         type: string
 *                         description: Name of the campaign
 *                         example: "Summer Sale"
 *                       linkCount:
 *                         type: integer
 *                         description: Number of links associated with the campaign
 *                         example: 5
 *                       keywordCount:
 *                         type: integer
 *                         description: Number of keywords associated with the campaign
 *                         example: 10
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request failed
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching campaign"
 *                 error:
 *                   type: string
 *                   description: Details of the error
 *                   example: "Sequelize instance is not defined"
 */
router.post("/campaigns-report/user", authorization(["read-report"]), getCampaignReportUser);
/**
 * @swagger
 * /report/campaign-report/campaign:
 *   post:
 *     summary: Fetch report for a single campaign
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: string
 *                 description: Unique identifier of the campaign
 *                 example: "123"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Optional start date to filter the campaign (inclusive)
 *                 example: "2025-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Optional end date to filter the campaign (inclusive)
 *                 example: "2025-12-31"
 *             required:
 *               - campaignId
 *     responses:
 *       200:
 *         description: Successfully fetched campaign report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Descriptive message about the response
 *                   example: "Campaign report fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaignId:
 *                       type: string
 *                       description: Unique identifier of the campaign
 *                       example: "123"
 *                     campaignName:
 *                       type: string
 *                       description: Name of the campaign
 *                       example: "Summer Sale"
 *                     linkCount:
 *                       type: integer
 *                       description: Number of links associated with the campaign
 *                       example: 5
 *                     keywordCount:
 *                       type: integer
 *                       description: Number of keywords associated with the campaign
 *                       example: 10
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request failed
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching campaign"
 *                 error:
 *                   type: string
 *                   description: Details of the error
 *                   example: "Sequelize instance is not defined"
 */
router.post("/campaign-report/campaign", authorization(["read-report"]), getOneCampaignReport);
export default router;