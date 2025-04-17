import express from "express";
import { getKeywordByCampaignId } from "../../controllers/coreController/bot.controller";
import { authorization } from "../../middleware/auth";

const router = express.Router();
/**
 * @swagger
 * /bot/keywords:
 *   post:
 *     summary: Retrieve keywords by campaign ID
 *     description: Fetches keywords associated with a specified campaign ID. Requires authentication.
 *     tags: [BOT]
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
 *                 description: The ID of the campaign to retrieve keywords for
 *                 example: 123
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
 *       404:
 *         description: Keywords not found
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
 *                   example: Keywords not found
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
 *                   example: Error fetching keywords
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/keywords",authorization(["read-bot-keywords"]), getKeywordByCampaignId);

export default router;
