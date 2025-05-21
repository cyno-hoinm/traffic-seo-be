import { Router } from "express";
import { getListDirectLinkByCampaignIdController } from "../../../controllers/coreController/directLink.controller";

const router = Router();

// swagger
/**
 * @swagger
 * tags:
 *   name: DirectLink
 *   description: DirectLink management
 */

/**
 * @swagger
 * /direct-link/campaign/{id}:
 *   get:
 *     summary: Get list direct link by campaign id
 *     tags: [DirectLink]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List direct link by campaign id
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/DirectLink'
 */                     
router.get("/campaign/:id", getListDirectLinkByCampaignIdController);

export default router;
