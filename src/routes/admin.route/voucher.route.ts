import express from "express";
import {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getVoucherByCode,
} from "../../controllers/moneyController/voucher.controller"; // Adjust path
import { authorization } from "../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /vouchers:
 *   post:
 *     summary: Create a new voucher
 *     description: Create a new voucher with a random 10-character uppercase code.
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *               - status
 *             properties:
 *               value:
 *                 type: number
 *                 description: Voucher value
 *                 example: 50.00
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, USED, EXPIRED]
 *                 description: Voucher status
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Voucher created successfully
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
 *                   example: Voucher created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: X7K9P2M4Q8
 *                     value:
 *                       type: number
 *                       example: 50.00
 *                     status:
 *                       type: string
 *                       example: ACTIVE
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
 *                   example: Valid value is required
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
 *                   example: Error creating voucher
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/", authorization(["create-voucher"]),createVoucher);

/**
 * @swagger
 * /vouchers:
 *   get:
 *     summary: Get all vouchers
 *     description: Retrieve a list of all vouchers.
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: Vouchers retrieved successfully
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
 *                   example: Vouchers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       code:
 *                         type: string
 *                         example: X7K9P2M4Q8
 *                       value:
 *                         type: number
 *                         example: 50.00
 *                       status:
 *                         type: string
 *                         example: ACTIVE
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00 
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-10T07:00:00 
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
 *                   example: Error fetching vouchers
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/", authorization(["create-transaction"]),getAllVouchers);

/**
 * @swagger
 * /vouchers/{id}:
 *   get:
 *     summary: Get a voucher by ID
 *     description: Retrieve a specific voucher by its ID.
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voucher ID
 *     responses:
 *       200:
 *         description: Voucher retrieved successfully
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
 *                   example: Voucher retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: X7K9P2M4Q8
 *                     value:
 *                       type: number
 *                       example: 50.00
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
 *       404:
 *         description: Voucher not found
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
 *                   example: Voucher not found
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
 *                   example: Error fetching voucher
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/:id",authorization(["create-transaction"]), getVoucherById);

/**
 * @swagger
 * /vouchers/code/{code}:
 *   get:
 *     summary: Get a voucher by code
 *     description: Retrieve a specific voucher by its unique code.
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher code (10-character uppercase)
 *     responses:
 *       200:
 *         description: Voucher retrieved successfully
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
 *                   example: Voucher retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: X7K9P2M4Q8
 *                     value:
 *                       type: number
 *                       example: 50.00
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
 *       400:
 *         description: Bad request - Missing code
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
 *                   example: Voucher code is required
 *                 error:
 *                   type: string
 *                   example: Missing required field
 *       404:
 *         description: Voucher not found
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
 *                   example: Voucher not found
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
 *                   example: Error fetching voucher by code
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/code/:code", authorization(["create-transaction"]),getVoucherByCode);

/**
 * @swagger
 * /vouchers/{id}:
 *   put:
 *     summary: Update a voucher by ID
 *     description: Update the value and/or status of an existing voucher.
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voucher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 description: New value of the voucher
 *                 example: 75.00
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, USED, EXPIRED]
 *                 description: New status of the voucher
 *                 example: USED
 *     responses:
 *       200:
 *         description: Voucher updated successfully
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
 *                   example: Voucher updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: X7K9P2M4Q8
 *                     value:
 *                       type: number
 *                       example: 75.00
 *                     status:
 *                       type: string
 *                       example: USED
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00 
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
 *                   example: Valid value or status is required
 *                 error:
 *                   type: string
 *                   example: Invalid field
 *       404:
 *         description: Voucher not found
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
 *                   example: Voucher not found
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
 *                   example: Error updating voucher
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.put("/:id",authorization(["create-transaction"]), updateVoucher);

/**
 * @swagger
 * /vouchers/{id}:
 *   delete:
 *     summary: Delete a voucher by ID
 *     description: Delete an existing voucher.
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voucher ID
 *     responses:
 *       200:
 *         description: Voucher deleted successfully
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
 *                   example: Voucher deleted successfully
 *       404:
 *         description: Voucher not found
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
 *                   example: Voucher not found
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
 *                   example: Error deleting voucher
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.delete("/:id", authorization(["create-transaction"]),deleteVoucher);

export default router;