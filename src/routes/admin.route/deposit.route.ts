import express from "express";
import {
  getDepositList,
  createDeposit,
  updateDeposit,
} from "../../controllers/moneyController/deposit.controller"; // Adjust path
import { authenticateToken } from "../../middleware/auth"; // Assuming you have auth middleware

const router = express.Router();

/**
 * @swagger
 * /deposits/search:
 *   get:
 *     summary: Get a list of deposits with filters
 *     description: Retrieve deposits filtered by userId, status, and createdAt date range with pagination.
 *     tags: [Deposits]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *         required: false
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *         description: Filter by deposit status
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
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of deposits per page
 *         required: false
 *       - in: query
 *         name: pageLimit
 *         schema:
 *           type: integer
 *         description: Page number
 *         required: false
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
 *                             example: 2025-04-10T07:00:00 
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-04-10T07:00:00 
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
router.get("/search", getDepositList);

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
 *               - method
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 1
 *               voucherId:
 *                 type: integer
 *                 description: ID of the voucher
 *                 example: 1
 *               amount:
 *                 type: number
 *                 description: Deposit amount
 *                 example: 100.00
 *               method:
 *                 type: string
 *                 description: Payment method
 *                 example: "CREDIT_CARD"
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
router.post("/", authenticateToken, createDeposit);

/**
 * @swagger
 * /deposits/{id}:
 *   put:
 *     summary: Update a deposit
 *     description: Update deposit status to COMPLETED or FAILED, creates a CHARGE transaction if COMPLETED.
 *     tags: [Deposits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deposit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - acceptedBy
 *               - status
 *             properties:
 *               acceptedBy:
 *                 type: string
 *                 description: Who accepted/processed the deposit
 *                 example: "admin2"
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, FAILED]
 *                 description: New status of the deposit
 *                 example: "COMPLETED"
 *     responses:
 *       200:
 *         description: Deposit updated successfully
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
 *                   example: Deposit updated successfully
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
 *                     paymentMethodId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "COMPLETED"
 *                     acceptedBy:
 *                       type: string
 *                       example: "admin2"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T08:00:00 
 *       400:
 *         description: Bad request - Invalid fields
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
 *                   example: Status must be COMPLETED or FAILED
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
 *                   example: Error updating deposit
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.put("/:id", authenticateToken, updateDeposit);

export default router;
