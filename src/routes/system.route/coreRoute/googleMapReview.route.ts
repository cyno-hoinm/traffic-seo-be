import express from "express";
import {
  getGoogleMapReviewList,
  createGoogleMapReview,
  getGoogleMapReviewById,
  updateGoogleMapReview,
  getGoogleMapReviewsByCampaignId,
} from "../../../controllers/coreController/googleMapReview.controller";
import { authorization } from "../../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /googleMapsReviews/search:
 *   post:
 *     summary: Get a list of GoogleMapReviews with filters
 *     description: Retrieve GoogleMapReviews filtered by campaignId, distribution, and createdAt date range.
 *     tags: [GoogleMapReviews]
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
 *         description: GoogleMapReviews retrieved successfully
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
 *                   example: GoogleMapReviews retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     googleMapReviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           campaignId:
 *                             type: integer
 *                             example: 1
 *                           content:
 *                             type: string
 *                             example: "Great service!"
 *                           location:
 *                             type: string
 *                             example: "New York"
 *                           googleMapUrl:
 *                             type: string
 *                             example: "https://maps.google.com/..."
 *                           imgUrls:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["https://example.com/image1.jpg"]
 *                           status:
 *                             type: integer
 *                             example: 1
 *                           cost:
 *                             type: number
 *                             example: 10.99
 *                           stars:
 *                             type: integer
 *                             example: 5
 *                     total:
 *                       type: integer
 *                       example: 1
 */
router.post("/search", authorization(["search-googleMapReviews"]), getGoogleMapReviewList);

/**
 * @swagger
 * /googleMapReviews/getByCampaign:
 *   post:
 *     summary: Get GoogleMapReviews by campaign ID
 *     description: Retrieve all GoogleMapReviews for a specific campaign.
 *     tags: [GoogleMapReviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 description: ID of the campaign
 *                 example: 1
 *     responses:
 *       200:
 *         description: GoogleMapReviews retrieved successfully
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
 *                   example: GoogleMapReviews retrieved successfully
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
 *                       content:
 *                         type: string
 *                         example: "Great service!"
 *                       location:
 *                         type: string
 *                         example: "New York"
 *                       googleMapUrl:
 *                         type: string
 *                         example: "https://maps.google.com/..."
 *                       imgUrls:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://example.com/image1.jpg"]
 *                       status:
 *                         type: integer
 *                         example: 1
 *                       cost:
 *                         type: number
 *                         example: 10.99
 *                       stars:
 *                         type: integer
 *                         example: 5
 */
router.post("/getByCampaign", authorization(["read-googleMapReview"]), getGoogleMapReviewsByCampaignId);

/**
 * @swagger
 * /googleMapReviews:
 *   post:
 *     summary: Create a new GoogleMapReview
 *     description: Create a new GoogleMapReview with required fields.
 *     tags: [GoogleMapReviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - content
 *               - location
 *               - googleMapUrl
 *               - imgUrls
 *               - status
 *               - cost
 *               - stars
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 description: ID of the campaign
 *                 example: 1
 *               content:
 *                 type: string
 *                 description: Review content
 *                 example: "Great service!"
 *               location:
 *                 type: string
 *                 description: Location of the review
 *                 example: "New York"
 *               googleMapUrl:
 *                 type: string
 *                 description: Google Maps URL
 *                 example: "https://maps.google.com/..."
 *               imgUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *                 example: ["https://example.com/image1.jpg"]
 *               status:
 *                 type: integer
 *                 description: Review status
 *                 example: 1
 *               cost:
 *                 type: number
 *                 description: Cost of the review
 *                 example: 10.99
 *               stars:
 *                 type: integer
 *                 description: Number of stars
 *                 example: 5
 *     responses:
 *       201:
 *         description: GoogleMapReview created successfully
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
 *                   example: GoogleMapReview created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "Great service!"
 *                     location:
 *                       type: string
 *                       example: "New York"
 *                     googleMapUrl:
 *                       type: string
 *                       example: "https://maps.google.com/..."
 *                     imgUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/image1.jpg"]
 *                     status:
 *                       type: integer
 *                       example: 1
 *                     cost:
 *                       type: number
 *                       example: 10.99
 *                     stars:
 *                       type: integer
 *                       example: 5
 */
router.post("/", authorization(["create-googleMapReview"]), createGoogleMapReview);

/**
 * @swagger
 * /googleMapReviews/{id}:
 *   get:
 *     summary: Get a GoogleMapReview by ID
 *     description: Retrieve a specific GoogleMapReview by its ID.
 *     tags: [GoogleMapReviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: GoogleMapReview ID
 *     responses:
 *       200:
 *         description: GoogleMapReview retrieved successfully
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
 *                   example: GoogleMapReview retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "Great service!"
 *                     location:
 *                       type: string
 *                       example: "New York"
 *                     googleMapUrl:
 *                       type: string
 *                       example: "https://maps.google.com/..."
 *                     imgUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/image1.jpg"]
 *                     status:
 *                       type: integer
 *                       example: 1
 *                     cost:
 *                       type: number
 *                       example: 10.99
 *                     stars:
 *                       type: integer
 *                       example: 5
 */
router.get("/:id", authorization(["read-googleMapReview"]), getGoogleMapReviewById);

/**
 * @swagger
 * /googleMapReviews/{id}:
 *   patch:
 *     summary: Update a GoogleMapReview by ID
 *     description: Updates specific fields of an existing GoogleMapReview identified by its ID.
 *     tags: [GoogleMapReviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the GoogleMapReview to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Review content
 *               location:
 *                 type: string
 *                 description: Location of the review
 *               googleMapUrl:
 *                 type: string
 *                 description: Google Maps URL
 *               imgUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               status:
 *                 type: integer
 *                 description: Review status
 *               cost:
 *                 type: number
 *                 description: Cost of the review
 *               stars:
 *                 type: integer
 *                 description: Number of stars
 *             example:
 *               content: "Updated review content"
 *               location: "Los Angeles"
 *               status: 2
 *               stars: 4
 *     responses:
 *       200:
 *         description: GoogleMapReview updated successfully
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
 *                   example: GoogleMapReview updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     campaignId:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "Updated review content"
 *                     location:
 *                       type: string
 *                       example: "Los Angeles"
 *                     googleMapUrl:
 *                       type: string
 *                       example: "https://maps.google.com/..."
 *                     imgUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/image1.jpg"]
 *                     status:
 *                       type: integer
 *                       example: 2
 *                     cost:
 *                       type: number
 *                       example: 10.99
 *                     stars:
 *                       type: integer
 *                       example: 4
 */
router.patch("/:id", authorization(["update-googleMapReview"]), updateGoogleMapReview);

export default router;
