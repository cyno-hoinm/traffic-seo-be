import express from "express";
import {
  createAgency,
  getAgencyById,
  getAllAgencies,
  updateAgency,
  deleteAgency,
  searchAgencies,
} from "../../../controllers/coreController/agency.controller"; // Adjust path to your Agency controller
import { authorization } from "../../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Agency:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the agency
 *         name:
 *           type: string
 *           description: The name of the agency
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp (UTC+7)
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp (UTC+7)
 *       example:
 *         id: 1
 *         name: "read_users"
 *         createdAt: "2025-04-10T14:00:00.000 "
 *         updatedAt: "2025-04-10T14:00:00.000 "
 */

/**
 * @swagger
 * /agencies:
 *   post:
 *     summary: Create a new agency
 *     tags: [Agencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the agency
 *               code:
 *                 type: string
 *                 description: The code of the agency
 *             example:
 *               name: "Tạo quyền"
 *               code: "create-agency"
 *     responses:
 *       201:
 *         description: Agency created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *       400:
 *         description: Validation failed or duplicate name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/", authorization(["create-agency"]), createAgency);

/**
 * @swagger
 * /agencies/{id}:
 *   get:
 *     summary: Get a agency by ID
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The agency ID
 *     responses:
 *       200:
 *         description: Agency retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agency'
 *       500:
 *         description: Internal server error
 */
router.get("/", authorization(["read-agencies"]), getAllAgencies);

/**
 * @swagger
 * /agencies/{id}:
 *   put:
 *     summary: Update a agency by ID
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The agency ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the agency
 *             example:
 *               name: "update_users"
 *     responses:
 *       200:
 *         description: Agency updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *       400:
 *         description: Validation failed or duplicate name
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
 *     summary: Delete a agency by ID
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The agency ID
 *     responses:
 *       200:
 *         description: Agency deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *     summary: Search and retrieve a paginated list of agencies
 *     description: Retrieves a list of agencies based on a search key with pagination support. Returns the agencies, total count, and pagination details.
 *     tags:
 *       - Agencies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - page
 *               - limit
 *             properties:
 *               key:
 *                 type: string
 *                 description: Optional search key to filter agencies
 *                 example: read
 *               page:
 *                 type: string
 *                 description: Page number for pagination (non-negative integer)
 *                 example: "1"
 *               limit:
 *                 type: string
 *                 description: Number of agencies per page (non-negative integer)
 *                 example: "10"
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
 *                   example: agencies retrieved successfully
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Agency object (structure depends on the repository)
 *       400:
 *         description: Invalid input
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
 *                   example: Invalid input
 *                 error:
 *                   type: string
 *                   example: pageLimit must be a non-negative integer
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
 *                   example: An unexpected error occurred
 */
router.post("/search",
  authorization(["read-agencies"]),
  searchAgencies)
export default router;
