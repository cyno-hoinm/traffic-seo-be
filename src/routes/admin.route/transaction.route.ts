import express from "express";
import {
  createTransaction,
  getListTransaction,
} from "../../controllers/moneyController/transaction.controller"; // Adjust path
import { authorization } from "../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction and update wallet balance (PAY decreases, REFUND increases).
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - amount
 *               - status
 *             properties:
 *               walletId:
 *                 type: integer
 *                 description: ID of the wallet
 *                 example: 1
 *               amount:
 *                 type: number
 *                 description: Transaction amount
 *                 example: 20.00
 *               status:
 *                 type: string
 *                 enum: [PAY, REFUND]
 *                 description: Transaction status
 *                 example: PAY
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
 *                   example: Transaction created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     walletId:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: number
 *                       example: 20.00
 *                     status:
 *                       type: string
 *                       example: PAY
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
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
 *                   example: Error creating transaction
 *                 error:
 *                   type: string
 *                   example: Insufficient wallet balance
 */
router.post("/", authorization(["create-transaction"]), createTransaction);

/**
 * @swagger
 * /transactions/search:
 *   post:
 *     summary: Get a list of transactions with filters
 *     description: Retrieve transactions filtered by walletId, status, and createdAt date range.
 *     tags: [Transactions]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletId:
 *                 type: integer
 *                 description: Filter by wallet ID
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [PAY, REFUND]
 *                 description: Filter by transaction status
 *                 example: PAY
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
 *         description: Transactions retrieved successfully
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
 *                   example: Transactions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       walletId:
 *                         type: integer
 *                         example: 1
 *                       amount:
 *                         type: number
 *                         example: 20.00
 *                       status:
 *                         type: string
 *                         example: PAY
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00
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
 *                   example: Error fetching transactions
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post(
  "/search",
  authorization(["search-transactions"]),
  getListTransaction
);

export default router;
