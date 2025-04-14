import express from "express";
import {
  createPermission,
  getPermissionById,
  getAllPermissions,
  updatePermission,
  deletePermission,
} from "../../controllers/roleController/permission.controller"; // Adjust path to your Permission controller
import { authorization } from "../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the permission
 *         name:
 *           type: string
 *           description: The name of the permission
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
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
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
 *                 description: The name of the permission
 *             example:
 *               name: "read_users"
 *     responses:
 *       201:
 *         description: Permission created successfully
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
 *                   $ref: '#/components/schemas/Permission'
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
router.post("/", authorization(["create-permission"]), createPermission);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get a permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
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
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authorization(["read-permission"]), getPermissionById);

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
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
 *                     $ref: '#/components/schemas/Permission'
 *       500:
 *         description: Internal server error
 */
router.get("/", authorization(["read-permissions"]), getAllPermissions);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update a permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The permission ID
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
 *                 description: The new name of the permission
 *             example:
 *               name: "update_users"
 *     responses:
 *       200:
 *         description: Permission updated successfully
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
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation failed or duplicate name
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authorization(["update-permission"]), updatePermission);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete a permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
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
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authorization(["delete-permission"]), deletePermission);

export default router;
