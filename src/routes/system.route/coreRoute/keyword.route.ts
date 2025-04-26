import express from "express";
import {
  getKeywordList,
  createKeyword,
  getKeywordById,
  updateKeyword,
} from "../../../controllers/coreController/keyword.controller"; // Adjust path
import { authorization } from "../../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /keywords/search:
 *   post:
 *     summary: Get a list of keywords with filters
 *     description: Retrieve keywords filtered by campaignId, distribution, and createdAt date range.
 *     tags: [Keywords]
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
 *               distribution:
 *                 type: string
 *                 enum: [DAY, MONTH, YEAR]
 *                 description: Filter by distribution type
 *                 example: DAY
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
 *         description: Keywords retrieved successfully
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
 *                   example: Keywords retrieved successfully
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
 *                       name:
 *                         type: string
 *                         example: "summer sale"
 *                       url:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://example.com/sale", "https://example.com/promo"]
 *                       distribution:
 *                         type: string
 *                         example: "DAY"
 *                       traffic:
 *                         type: integer
 *                         example: 0
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
 *                   example: Error fetching keywords
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/search", authorization(["search-keywords"]), getKeywordList);

/**
 * @swagger
 * /keywords:
 *   post:
 *     summary: Create a new keyword
 *     description: Create a new keyword with required fields.
 *     tags: [Keywords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - name
 *               - url
 *               - distribution
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 description: ID of the campaign
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Name of the keyword
 *                 example: "summer sale"
 *               url:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of URLs
 *                 example: ["https://example.com/sale", "https://example.com/promo"]
 *               distribution:
 *                 type: string
 *                 enum: [DAY, MONTH, YEAR]
 *                 description: Distribution type
 *                 example: "DAY"
 *     responses:
 *       201:
 *         description: Keyword created successfully
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
 *                   example: Keyword created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "summer sale"
 *                     url:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/sale", "https://example.com/promo"]
 *                     distribution:
 *                       type: string
 *                       example: "DAY"
 *                     traffic:
 *                       type: integer
 *                       example: 0
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
 *                   example: Error creating keyword
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/", authorization(["create-keyword"]), createKeyword);

/**
 * @swagger
 * /keywords/{id}:
 *   get:
 *     summary: Get a keyword by ID
 *     description: Retrieve a specific keyword by its ID.
 *     tags: [Keywords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Keyword ID
 *     responses:
 *       200:
 *         description: Keyword retrieved successfully
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
 *                   example: Keyword retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "summer sale"
 *                     url:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/sale", "https://example.com/promo"]
 *                     distribution:
 *                       type: string
 *                       example: "DAY"
 *                     traffic:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *       404:
 *         description: Keyword not found
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
 *                   example: Keyword not found
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
 *                   example: Error fetching keyword
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/:id", authorization(["read-keyword"]), getKeywordById);

/**
 * @swagger
 * /keywords/{id}:
 *   patch:
 *     summary: Update a keyword by ID
 *     description: Updates specific fields of an existing keyword identified by its ID. Only provided fields are updated. The fields `traffic` and `campaignId` cannot be updated through this endpoint.
 *     tags:
 *       - Keywords
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the keyword to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the keyword
 *               url:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of URLs associated with the keyword
 *               distribution:
 *                 type: string
 *                 enum: [DAY, MONTH, YEAR]
 *                 description: The distribution type of the keyword
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 description: The status type of the keyword
 *               isDeleted:
 *                 type: boolean
 *                 description: Whether the keyword is marked as deleted
 *             example:
 *               name: "New Keyword"
 *               url: ["https://example.com", "https://example.org"]
 *               distribution: "DAY"
 *               isDeleted: false
 *               status : "INACTIVE"
 *     responses:
 *       200:
 *         description: Keyword updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the updated keyword
 *                 campaignId:
 *                   type: integer
 *                   description: ID of the campaign
 *                 name:
 *                   type: string
 *                   description: The name of the keyword
 *                 url:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of URLs
 *                 distribution:
 *                   type: string
 *                   description: The distribution type
 *                 traffic:
 *                   type: number
 *                   description: Traffic count
 *                 isDeleted:
 *                   type: boolean
 *                   description: Whether the keyword is deleted
 *                 createdAt:
 *                   type: string
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   description: Last update timestamp
 *               example:
 *                 id: 1
 *                 campaignId: 10
 *                 name: "New Keyword"
 *                 url: ["https://example.com", "https://example.org"]
 *                 distribution: "organic"
 *                 traffic: 100
 *                 isDeleted: false
 *                 createdAt: "2025-04-17T10:00:00"
 *                 updatedAt: "2025-04-17T12:00:00"
 *       400:
 *         description: Invalid keyword ID
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
 *                 message: "Invalid keyword ID"
 *                 code: 400
 *       404:
 *         description: Keyword not found
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
 *                 message: "Keyword with id 1 not found"
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
router.patch("/:id", authorization(["update-keyword"]), updateKeyword);
export default router;
