import express from "express";
import {
  getDepositList,
  createDeposit,
  getDepositById,
  getDepositByOrderId,
} from "../../controllers/moneyController/deposit.controller"; // Adjust path
import { authorization } from "../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /deposits/search:
 *   post:
 *     summary: Get a list of deposits with filters
 *     description: Retrieve deposits filtered by userId, status, and createdAt date range with pagination.
 *     tags: [Deposits]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED]
 *                 description: Filter by deposit status
 *                 example: "PENDING"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start of the createdAt date range
 *                 example: "2025-04-10T00:00:00"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End of the createdAt date range
 *                 example: "2025-04-20T23:59:59"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination (default is 0, which skips pagination)
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of deposits per page (default is 0, which skips pagination)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Deposits retrieved successfully
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
 *                   example: Deposits retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deposits:
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
 *                           voucherId:
 *                             type: integer
 *                             example: 1
 *                           amount:
 *                             type: number
 *                             example: 100.00
 *                           method:
 *                             type: string
 *                             example: "CREDIT_CARD"
 *                           status:
 *                             type: string
 *                             example: "PENDING"
 *                           acceptedBy:
 *                             type: string
 *                             example: "admin"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-10T07:00:00"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-10T07:00:00"
 *                     total:
 *                       type: integer
 *                       example: 25
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
 *                   example: Error fetching deposits
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/search", authorization(["search-deposits"]), getDepositList);

/**
 * @swagger
 * /deposits:
 *   post:
 *     summary: Create a new deposit
 *     description: Create a deposit with PENDING status, requires wallet existence.
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - voucherId
 *               - amount
 *               - paymentMethodId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 1
 *               voucherId:
 *                 type: integer
 *                 description: ID of the voucher
 *                 example: 1
 *               paymentMethodId:
 *                 type: integer
 *                 description: ID of payment method
 *                 example: 3
 *               amount:
 *                 type: number
 *                 description: Deposit amount
 *                 example: 100.00
 *     responses:
 *       201:
 *         description: Deposit created successfully
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
 *                   example: Deposit created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     voucherId:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: number
 *                       example: 100.00
 *                     method:
 *                       type: string
 *                       example: "CREDIT_CARD"
 *                     status:
 *                       type: string
 *                       example: "PENDING"
 *                     acceptedBy:
 *                       type: string
 *                       example: "admin"
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
 *                   example: Error creating deposit
 *                 error:
 *                   type: string
 *                   example: Wallet not found for this user
 */
router.post("/",
  // authorization(["create-deposit"]),
  createDeposit);

/**
 * @swagger
 * /deposits/{id}:
 *   get:
 *     summary: Retrieve a deposit by its ID
 *     description: Fetches a deposit record by its unique ID. Requires authentication.
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the deposit
 *     responses:
 *       200:
 *         description: Deposit retrieved successfully
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
 *                   example: Deposit retrieved successfully
 *       400:
 *         description: Invalid deposit ID
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
 *                   example: Invalid deposit ID
 *                 error:
 *                   type: string
 *                   example: Invalid field
 *       404:
 *         description: Deposit not found
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
 *                   example: Deposit not found
 *                 error:
 *                   type: string
 *                   example: Not found
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
 *                   example: Error fetching deposit
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/:id",authorization(["read-deposit-admin"]), getDepositById);
/**
 * @swagger
 * /deposits/order/{orderId}:
 *   get:
 *     summary: Retrieve a deposit by its order ID
 *     description: Fetches a deposit record by its order ID, ensuring the authenticated user has access. Requires authentication.
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order ID associated with the deposit
 *     responses:
 *       200:
 *         description: Deposit retrieved successfully
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
 *                   example: Deposit retrieved successfully
 *       403:
 *         description: Forbidden - User does not have permission to access this deposit
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
 *                   example: You do not have permission to access this deposit
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Deposit not found
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
 *                   example: Deposit not found
 *                 error:
 *                   type: string
 *                   example: Not found
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
 *                   example: Error fetching deposit
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/order/:orderId", authorization(["read-deposit-user"]),getDepositByOrderId);

export default router;
