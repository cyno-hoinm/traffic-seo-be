import express from "express";
import {
  getCampaignList,
  createCampaign,
  getCampaignById,
} from "../../controllers/coreController/campaign.controller"; // Adjust path
import { authorization } from "../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /campaigns/search:
 *   post:
 *     summary: Get a list of campaigns with filters
 *     description: Retrieve campaigns filtered by various conditions, with pagination support.
 *     tags: [Campaigns]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Filter by user ID
 *                 example: 1
 *               countryId:
 *                 type: integer
 *                 description: Filter by country ID
 *                 example: 1
 *               campaignTypeId:
 *                 type: string
 *                 description: Filter by campaign type
 *                 example: "1"
 *               device:
 *                 type: string
 *                 description: Filter by device
 *                 example: "Mobile"
 *               timeCode:
 *                 type: string
 *                 description: Filter by time code
 *                 example: "UTC"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by start date (gte)
 *                 example: "2025-04-10T00:00:00"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by end date (lte)
 *                 example: "2025-04-20T23:59:59"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *                 description: Filter by campaign status
 *                 example: "ACTIVE"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination (default is 0, which skips pagination)
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of campaigns per page (default is 0, which skips pagination)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Campaigns retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Campaigns retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaigns:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: integer
 *                             example: 1
 *                           countryId:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Summer Sale"
 *                           type:
 *                             type: string
 *                             example: "1"
 *                           campaignTypeId:
 *                             type: integer
 *                             example: 1
 *                           device:
 *                             type: string
 *                             example: "Mobile"
 *                           timeCode:
 *                             type: string
 *                             example: "UTC"
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-10T00:00:00"
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-20T23:59:59"
 *                           totalTraffic:
 *                             type: integer
 *                             example: 0
 *                           cost:
 *                             type: number
 *                             example: 500.00
 *                           domain:
 *                             type: string
 *                             example: "example.com"
 *                           search:
 *                             type: string
 *                             example: "Google"
 *                           status:
 *                             type: string
 *                             example: "ACTIVE"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-09T07:00:00"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-09T07:00:00"
 *                     total:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Bad request - Invalid filter parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid startDate format
 *                 error:
 *                   type: string
 *                   example: Invalid field
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching campaigns
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/search", authorization(["search-campaigns"]), getCampaignList);

/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Create a new campaign
 *     description: Create a new campaign with required fields.
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - countryId
 *               - name
 *               - campaignTypeId
 *               - device
 *               - timeCode
 *               - startDate
 *               - endDate
 *               - cost
 *               - domain
 *               - search
 *               - status
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 1
 *               countryId:
 *                 type: integer
 *                 description: ID of the country
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Name of the campaign
 *                 example: "Summer Sale"
 *               campaignTypeId:
 *                 type: string
 *                 description: Type of the campaign
 *                 example: "1"
 *               device:
 *                 type: string
 *                 description: Device target
 *                 example: "Mobile"
 *               timeCode:
 *                 type: string
 *                 description: Time zone code
 *                 example: "UTC "
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the campaign
 *                 example: 2025-04-10T00:00:00
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the campaign
 *                 example: 2025-04-20T23:59:59
 *               cost:
 *                 type: number
 *                 description: Cost of the campaign
 *                 example: 500.00
 *               domain:
 *                 type: string
 *                 description: Target domain
 *                 example: "example.com"
 *               search:
 *                 type: string
 *                 description: Search engine
 *                 example: "Google"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *                 description: Status of the campaign
 *                 example: "ACTIVE"
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Campaign created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     countryId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Summer Sale"
 *                     type:
 *                       type: string
 *                       example: "PPC"
 *                     device:
 *                       type: string
 *                       example: "Mobile"
 *                     timeCode:
 *                       type: string
 *                       example: "UTC "
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T00:00:00
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-20T23:59:59
 *                     totalTraffic:
 *                       type: integer
 *                       example: 0
 *                     cost:
 *                       type: number
 *                       example: 500.00
 *                     domain:
 *                       type: string
 *                       example: "example.com"
 *                     search:
 *                       type: string
 *                       example: "Google"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *       400:
 *         description: Bad request - Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: All fields are required
 *                 error:
 *                   type: string
 *                   example: Missing or invalid field
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error creating campaign
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/", authorization(["create-campaign"]), createCampaign);

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get a campaign by ID
 *     description: Retrieve a specific campaign by its ID.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Campaign retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     countryId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Summer Sale"
 *                     type:
 *                       type: string
 *                       example: "PPC"
 *                     device:
 *                       type: string
 *                       example: "Mobile"
 *                     timeCode:
 *                       type: string
 *                       example: "UTC "
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T00:00:00
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-20T23:59:59
 *                     totalTraffic:
 *                       type: integer
 *                       example: 0
 *                     cost:
 *                       type: number
 *                       example: 500.00
 *                     domain:
 *                       type: string
 *                       example: "example.com"
 *                     search:
 *                       type: string
 *                       example: "Google"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Campaign not found
 *                 error:
 *                   type: string
 *                   example: Resource not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching campaign
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/:id", authorization(["read-campaigns"]), getCampaignById);

export default router;
