import express from "express";
import {
  getLinkList,
  createLink,
  getLinkById,
  updateLink,
  getLinkByCampaignId,
  checkUrlIndexing,
} from "../../../controllers/coreController/link.controller"; // Adjust path
import { authorization } from "../../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /links/search:
 *   post:
 *     summary: Get a list of links with filters
 *     description: Retrieve links filtered by campaignId, status, and createdAt date range.
 *     tags: [Links]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 description: Filter by campaign ID
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *                 description: Filter by link status
 *                 example: ACTIVE
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start of the createdAt date range
 *                 example: 2025-04-01T00:00:00
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End of the createdAt date range
 *                 example: 2025-04-10T23:59:59
 *     responses:
 *       200:
 *         description: Links retrieved successfully
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
 *                   example: Links retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       campaignId:
 *                         type: integer
 *                         example: 1
 *                       link:
 *                         type: string
 *                         example: "https://example.com/link"
 *                       linkTo:
 *                         type: string
 *                         example: "https://example.com/destination"
 *                       distribution:
 *                         type: string
 *                         example: "DAY"
 *                       traffic:
 *                         type: integer
 *                         example: 0
 *                       anchorText:
 *                         type: string
 *                         example: "Click here"
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *                       url:
 *                         type: string
 *                         example: "https://example.com"
 *                       page:
 *                         type: string
 *                         example: "/home"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00
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
 *                   example: Invalid start_date format
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
 *                   example: Error fetching links
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/search", authorization(["search-links"]), getLinkList);

/**
 * @swagger
 * /links:
 *   post:
 *     summary: Create a new link
 *     description: Create a new link with required fields.
 *     tags: [Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - link
 *               - linkTo
 *               - distribution
 *               - anchorText
 *               - status
 *               - url
 *               - page
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 description: ID of the campaign
 *                 example: 1
 *               link:
 *                 type: string
 *                 description: Source link URL
 *                 example: "https://example.com/link"
 *               linkTo:
 *                 type: string
 *                 description: Destination link URL
 *                 example: "https://example.com/destination"
 *               distribution:
 *                 type: string
 *                 description: Distribution method
 *                 example: "DAY"
 *               anchorText:
 *                 type: string
 *                 description: Anchor text for the link
 *                 example: "Click here"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *                 description: Status of the link
 *                 example: "ACTIVE"
 *               url:
 *                 type: string
 *                 description: Base URL
 *                 example: "https://example.com"
 *               page:
 *                 type: string
 *                 description: Page path
 *                 example: "/home"
 *     responses:
 *       201:
 *         description: Link created successfully
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
 *                   example: Link created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     link:
 *                       type: string
 *                       example: "https://example.com/link"
 *                     linkTo:
 *                       type: string
 *                       example: "https://example.com/destination"
 *                     distribution:
 *                       type: string
 *                       example: "DAY"
 *                     traffic:
 *                       type: integer
 *                       example: 0
 *                     anchorText:
 *                       type: string
 *                       example: "Click here"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     url:
 *                       type: string
 *                       example: "https://example.com"
 *                     page:
 *                       type: string
 *                       example: "/home"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
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
 *                   example: Error creating link
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/", authorization(["create-link"]), createLink);

/**
 * @swagger
 * /links/{id}:
 *   get:
 *     summary: Get a link by ID
 *     description: Retrieve a specific link by its ID.
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Link ID
 *     responses:
 *       200:
 *         description: Link retrieved successfully
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
 *                   example: Link retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     link:
 *                       type: string
 *                       example: "https://example.com/link"
 *                     linkTo:
 *                       type: string
 *                       example: "https://example.com/destination"
 *                     distribution:
 *                       type: string
 *                       example: "DAY"
 *                     traffic:
 *                       type: integer
 *                       example: 0
 *                     anchorText:
 *                       type: string
 *                       example: "Click here"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     url:
 *                       type: string
 *                       example: "https://example.com"
 *                     page:
 *                       type: string
 *                       example: "/home"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *       404:
 *         description: Link not found
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
 *                   example: Link not found
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
 *                   example: Error fetching link
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/:id", authorization(["read-link"]), getLinkById);

/**
 * @swagger
 * /links/{id}:
 *   patch:
 *     summary: Update a link by ID
 *     description: Updates specific fields of an existing link identified by its ID. Only provided fields are updated.
 *     tags:
 *       - Links
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the link to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               link:
 *                 type: string
 *                 description: The link URL
 *               linkTo:
 *                 type: string
 *                 description: The destination URL
 *               distribution:
 *                 type: string
 *                 enum: [DAY, MONTH, YEAR]
 *                 description: The distribution type of the link
 *               anchorText:
 *                 type: string
 *                 description: The anchor text for the link
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, PENDING, COMPLETED]
 *                 description: The status of the link
 *               url:
 *                 type: string
 *                 description: The URL associated with the link
 *               page:
 *                 type: string
 *                 description: The page associated with the link
 *               isDeleted:
 *                 type: boolean
 *                 description: Whether the link is marked as deleted
 *             example:
 *               link: "https://example.com"
 *               anchorText: "Example Link"
 *               status: "active"
 *     responses:
 *       200:
 *         description: Link updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the updated link
 *                 campaignId:
 *                   type: integer
 *                   description: ID of the campaign
 *                 link:
 *                   type: string
 *                   description: The link URL
 *                 linkTo:
 *                   type: string
 *                   description: The destination URL
 *                 distribution:
 *                   type: string
 *                   description: The distribution type
 *                 traffic:
 *                   type: number
 *                   description: Traffic count
 *                 anchorText:
 *                   type: string
 *                   description: The anchor text
 *                 status:
 *                   type: string
 *                   description: The status of the link
 *                 url:
 *                   type: string
 *                   description: The URL
 *                 page:
 *                   type: string
 *                   description: The page
 *                 isDeleted:
 *                   type: boolean
 *                   description: Whether the link is deleted
 *               example:
 *                 link: "https://example.com"
 *                 linkTo: "https://destination.com"
 *                 distribution: "DAY"
 *                 anchorText: "Example Link"
 *                 status: "COMPLETED"
 *                 url: "https://example.com/page"
 *                 page: "/page"
 *                 isDeleted: false
 *       400:
 *         description: Invalid link ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *               example:
 *                 name: "ValidationError"
 *                 message: "Invalid link ID"
 *                 code: 400
 *       404:
 *         description: Link not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *               example:
 *                 name: "NotFoundError"
 *                 message: "Link with id 1 not found"
 *                 code: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *               example:
 *                 name: "InternalServerError"
 *                 message: "An unexpected error occurred"
 *                 code: 500
 */
router.patch("/:id", authorization(["update-link"]),  updateLink);


/**
 * @swagger
 * /links/campaign/{id}:
 *   get:
 *     summary: Get a link by ID campaign
 *     description: Retrieve a specific link by its ID campaign
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Link campaign ID
 *     responses:
 *       200:
 *         description: Link retrieved successfully
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
 *                   example: Link retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     link:
 *                       type: string
 *                       example: "https://example.com/link"
 *                     linkTo:
 *                       type: string
 *                       example: "https://example.com/destination"
 *                     distribution:
 *                       type: string
 *                       example: "DAY"
 *                     traffic:
 *                       type: integer
 *                       example: 0
 *                     anchorText:
 *                       type: string
 *                       example: "Click here"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     url:
 *                       type: string
 *                       example: "https://example.com"
 *                     page:
 *                       type: string
 *                       example: "/home"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *       404:
 *         description: Link not found
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
 *                   example: Link not found
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
 *                   example: Error fetching link
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/campaign/:id", authorization(["read-link"]), getLinkByCampaignId);

/**
 * @swagger
 * /links/check-indexing:
 *   post:
 *     summary: Check if a URL is indexed by Google
 *     description: Check if a given URL is indexed in Google search results
 *     tags: [Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - urls
 *             properties:
 *               urls:
 *                 type: array
 *                 description: The URLs to check for indexing
 *                 example: ["https://example.com/page", "https://example.com/page2"]
 *     responses:
 *       200:
 *         description: URL indexing status checked successfully
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
 *                   example: URL indexing status checked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isIndexed:
 *                       type: boolean
 *                       example: true
 *                     url:
 *                       type: string
 *                       example: "https://example.com/page"
 *                     lastCrawled:
 *                       type: string
 *                       example: "Apr 10, 2025"
 *       400:
 *         description: Bad request - Invalid URL
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
 *                   example: Invalid URL format
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
 *                   example: Error checking URL indexing status
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/check-indexing", authorization(["read-link"]), checkUrlIndexing);

export default router;
