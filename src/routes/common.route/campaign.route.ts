import express from "express";
import {
  getCampaignList,
  createCampaign,
  getCampaignById,
} from "../../controllers/coreController/campaign.controller"; // Adjust path

const router = express.Router();

/**
 * @swagger
 * /campaigns/list:
 *   get:
 *     summary: Get a list of campaigns with filters
 *     description: Retrieve campaigns filtered by various conditions.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *         required: false
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: integer
 *         description: Filter by country ID
 *         required: false
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by campaign type
 *         required: false
 *       - in: query
 *         name: device
 *         schema:
 *           type: string
 *         description: Filter by device
 *         required: false
 *       - in: query
 *         name: timeCode
 *         schema:
 *           type: string
 *         description: Filter by time code
 *         required: false
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date (gte)
 *         required: false
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date (lte)
 *         required: false
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING]
 *         description: Filter by campaign status
 *         required: false
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                       countryId:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Summer Sale"
 *                       type:
 *                         type: string
 *                         example: "PPC"
 *                       device:
 *                         type: string
 *                         example: "Mobile"
 *                       timeCode:
 *                         type: string
 *                         example: "UTC+07:00"
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T00:00:00+07:00
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-20T23:59:59+07:00
 *                       totalTraffic:
 *                         type: integer
 *                         example: 0
 *                       cost:
 *                         type: number
 *                         example: 500.00
 *                       domain:
 *                         type: string
 *                         example: "example.com"
 *                       search:
 *                         type: string
 *                         example: "Google"
 *                       keyword:
 *                         type: string
 *                         example: "summer sale"
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-09T07:00:00+07:00
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-09T07:00:00+07:00
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
router.get("/list", getCampaignList);

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
 *               - type
 *               - device
 *               - timeCode
 *               - startDate
 *               - endDate
 *               - cost
 *               - domain
 *               - search
 *               - keyword
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
 *               type:
 *                 type: string
 *                 description: Type of the campaign
 *                 example: "PPC"
 *               device:
 *                 type: string
 *                 description: Device target
 *                 example: "Mobile"
 *               timeCode:
 *                 type: string
 *                 description: Time zone code
 *                 example: "UTC+07:00"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the campaign
 *                 example: 2025-04-10T00:00:00+07:00
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the campaign
 *                 example: 2025-04-20T23:59:59+07:00
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
 *               keyword:
 *                 type: string
 *                 description: Target keyword
 *                 example: "summer sale"
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
 *                       example: "UTC+07:00"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T00:00:00+07:00
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-20T23:59:59+07:00
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
 *                     keyword:
 *                       type: string
 *                       example: "summer sale"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00+07:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00+07:00
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
router.post("/", createCampaign);

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
 *                       example: "UTC+07:00"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T00:00:00+07:00
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-20T23:59:59+07:00
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
 *                     keyword:
 *                       type: string
 *                       example: "summer sale"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00+07:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00+07:00
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
router.get("/:id", getCampaignById);

export default router;
