import express from "express";
import {
  getLinkList,
  createLink,
  getLinkById,
} from "../../controllers/coreController/link.controller"; // Adjust path
import { authorization } from "../../middleware/auth";

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
router.post("/search", authorization(["read-links"]), getLinkList);

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

export default router;
