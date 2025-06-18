import express from "express";
import {
  createAgency,
  getAgencyById,
  getAllAgencies,
  updateAgency,
  deleteAgency,
  searchAgencies,
  getMyAgency,
} from "../../../controllers/coreController/agency.controller";
import { authorization } from "../../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /agencies/getMe:
 *   post:
 *     summary: Get agencies assigned to the authenticated user
 *     tags:
 *       - Agencies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agencies retrieved successfully
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
 *                   example: Agencies retrieved successfully
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/Agency'
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */

router.post("/getMe", authorization(["read-agency"]), getMyAgency);

/**
 * @swagger
 * components:
 *   schemas:
 *     Agency:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         inviteCode:
 *           type: string
 *         bankName:
 *           type: string
 *         bankAccount:
 *           type: string
 *         accountHolder:
 *           type: string
 *         status:
 *           type: integer
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         userId: 2
 *         inviteCode: "d80fadc3-2c3b-4ae7-9476-1a9c2a9e1e1b"
 *         bankName: "Vietcombank"
 *         bankAccount: "0123456789"
 *         accountHolder: "Nguyen Van A"
 *         status: 1
 *         isDeleted: false
 *         createdAt: "2025-05-06T08:00:00.000Z"
 *         updatedAt: "2025-05-06T08:00:00.000Z"
 */

/**
 * @swagger
 * /agencies:
 *   post:
 *     summary: Create a new agency
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankName
 *               - bankAccount
 *               - accountHolder
 *             properties:
 *               bankName:
 *                 type: string
 *               bankAccount:
 *                 type: string
 *               accountHolder:
 *                 type: string
 *             example:
 *               bankName: "VietinBank"
 *               bankAccount: "123456789"
 *               accountHolder: "Le Thi B"
 *     responses:
 *       201:
 *         description: Agency created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agency'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", authorization(["create-agency"]), createAgency);

/**
 * @swagger
 * /agencies/{id}:
 *   get:
 *     summary: Get an agency by ID
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the agency
 *     responses:
 *       200:
 *         description: Agency retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agency'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Agency not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authorization(["read-agency"]), getAgencyById);

/**
 * @swagger
 * /agencies:
 *   get:
 *     summary: Get all agencies
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all agencies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agency'
 *       500:
 *         description: Internal server error
 */
router.get("/", authorization(["read-agencies"]), getAllAgencies);

/**
 * @swagger
 * /agencies/{id}:
 *   put:
 *     summary: Update an agency by ID
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the agency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *               bankAccount:
 *                 type: string
 *               accountHolder:
 *                 type: string
 *             example:
 *               bankName: "BIDV"
 *               bankAccount: "987654321"
 *               accountHolder: "Tran Van C"
 *     responses:
 *       200:
 *         description: Agency updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Agency not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authorization(["update-agency"]), updateAgency);

/**
 * @swagger
 * /agencies/{id}:
 *   delete:
 *     summary: Delete an agency by ID
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the agency
 *     responses:
 *       200:
 *         description: Agency deleted successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Agency not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authorization(["delete-agency"]), deleteAgency);

/**
 * @swagger
 * /agencies/search:
 *   post:
 *     summary: Search agencies with pagination
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *             example:
 *               key: "viet"
 *               page: 1
 *               limit: 10
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 list:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agency'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/search", authorization(["read-agency"]), searchAgencies);






export default router;
