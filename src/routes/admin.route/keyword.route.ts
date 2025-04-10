import express from "express";
import {
  getKeywordList,
  createKeyword,
  getKeywordById,
} from "../../controllers/coreController/keyword.controller"; // Adjust path

const router = express.Router();

/**
 * @swagger
 * /keywords/search:
 *   get:
 *     summary: Get a list of keywords with filters
 *     description: Retrieve keywords filtered by campaignId, distribution, and createdAt date range.
 *     tags: [Keywords]
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         description: Filter by campaign ID
 *         required: false
 *       - in: query
 *         name: distribution
 *         schema:
 *           type: string
 *           enum: [EVEN, WEIGHTED, RANDOM]
 *         description: Filter by distribution type
 *         required: false
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of the createdAt date range
 *         required: false
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End of the createdAt date range
 *         required: false
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
 *                         example: "EVEN"
 *                       traffic:
 *                         type: integer
 *                         example: 0
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00+07:00
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00+07:00
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
router.get("/search", getKeywordList);

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
 *                 enum: [EVEN, WEIGHTED, RANDOM]
 *                 description: Distribution type
 *                 example: "EVEN"
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
 *                       example: "EVEN"
 *                     traffic:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00+07:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00+07:00
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
router.post("/", createKeyword);

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
 *                       example: "EVEN"
 *                     traffic:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00+07:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00+07:00
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
router.get("/:id", getKeywordById);

export default router;
