import express from "express";
import {
  createNotification,
  getNotificationsByUserIdAndType,
} from "../../../controllers/commonController/notification.controller";
import { authorization } from "../../../middleware/auth";
// ok em
const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     description: Create a new notification for a user.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - content
 *               - type
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Name of the notification
 *                 example: "Payment Reminder"
 *               content:
 *                 type: string
 *                 description: Content of the notification
 *                 example: "Your payment is due tomorrow."
 *               type:
 *                 type: string
 *                 description: Type of the notification
 *                 example: "INFO"
 *     responses:
 *       201:
 *         description: Notification created successfully
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
 *                   example: Notification created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Payment Reminder"
 *                     content:
 *                       type: string
 *                       example: "Your payment is due tomorrow."
 *                     type:
 *                       type: string
 *                       example: "INFO"
 *                     createdAt:
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
 *                   example: Error creating notification
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/", authorization(["create-notification"]), createNotification);

/**
 * @swagger
 * /notifications/search:
 *   post:
 *     summary: Get notifications by userId and type
 *     description: Retrieve notifications filtered by userId and optionally by type, with pagination support.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 1
 *               type:
 *                 type: string
 *                 description: Type of the notification
 *                 example: "INFO"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination (default is 0, which skips pagination)
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of notifications per page (default is 0, which skips pagination)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
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
 *                   example: Notifications retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
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
 *                           name:
 *                             type: string
 *                             example: "Payment Reminder"
 *                           content:
 *                             type: string
 *                             example: "Your payment is due tomorrow."
 *                           type:
 *                             type: string
 *                             example: "INFO"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-10T07:00:00"
 *                     total:
 *                       type: integer
 *                       example: 50
 *       400:
 *         description: Bad request - Missing or invalid userId
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
 *                   example: userId is required
 *                 error:
 *                   type: string
 *                   example: Missing required field
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
 *                   example: Error fetching notifications
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post(
  "/search",
  authorization(["search-notifications"]),
  getNotificationsByUserIdAndType
);

export default router;
