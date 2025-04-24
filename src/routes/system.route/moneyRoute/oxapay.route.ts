import express from "express";
import { createInvoice, withDraw, checkMyIP, getCurrencies } from "../../../controllers/moneyController/oxapay.controller";

const router = express.Router();

/**
 * @swagger
 * /oxapay/createInvoice:
 *   post:
 *     summary: Create a new invoice (Don't use!)
 *     description: Create an invoice using Oxapay service.
 *     tags: [Oxapay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50
 *               currency:
 *                 type: string
 *                 example: USDT
 *     responses:
 *       200:
 *         description: Invoice created successfully
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
 *                   example: ""
 *                 data:
 *                   type: object
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
 *                   example: Internal error message
 */

router.post("/createInvoice",createInvoice);

/**
 * @swagger
 * /oxapay/createPayout:
 *   post:
 *     summary: Create a payout
 *     description: Create a payout to a predefined wallet address using Oxapay.
 *     tags: [Oxapay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               currency:
 *                 type: string
 *                 example: BTC
 *               description:
 *                 type: string
 *                 example: Payout for user reward
 *     responses:
 *       200:
 *         description: Payout created successfully
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
 *                   example: ""
 *                 data:
 *                   type: object
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
 *                   example: Internal error message
 */
router.post("/createPayout",withDraw);
/**
 * @swagger
 * /oxapay/getMyIP:
 *   get:
 *     summary: Get server's public IP
 *     description: Retrieve the public IP address of the server making the request.
 *     tags: [Oxapay]
 *     responses:
 *       200:
 *         description: IP address retrieved successfully
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
 *                   example: ""
 *                 data:
 *                   type: string
 *                   example: "123.456.78.90"
 *       500:
 *         description: Error getting IP
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
 *                   example: Error get IP
 *                 error:
 *                   type: string
 *                   example: Internal error message
 */
router.get("/getMyIP",checkMyIP);

/**
 * @swagger
 * /oxapay/getCurrencies:
 *   get:
 *     summary: Get list of supported currencies
 *     description: Retrieve a list of all supported currencies from Oxapay.
 *     tags: [Oxapay]
 *     responses:
 *       200:
 *         description: List of currencies
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
 *                   example: List currencies!
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error fetching currencies
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
 *                   example: Error fetching currencies!
 *                 error:
 *                   type: string
 *                   example: Internal error message
 */
router.get("/getCurrencies",getCurrencies)

export default router;
