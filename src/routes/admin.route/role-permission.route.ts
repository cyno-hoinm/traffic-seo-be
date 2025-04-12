import express from "express";
import {
  createRolePermission,
  getRolePermissionById,
  getAllRolePermissions,
  updateRolePermission,
  deleteRolePermission,
} from "../../controllers/roleController/role-permission.controller";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       required:
 *         - roleId
 *         - permissionId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the role-permission association
 *         roleId:
 *           type: integer
 *           description: The ID of the associated role
 *         permissionId:
 *           type: integer
 *           description: The ID of the associated permission
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
 *         roleId: 1
 *         permissionId: 1
 *         createdAt: "2025-04-10T14:00:00.000 "
 *         updatedAt: "2025-04-10T14:00:00.000 "
 */

/**
 * @swagger
 * /role-permissions:
 *   post:
 *     summary: Create a new role-permission association
 *     tags: [RolePermissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionId
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: The ID of the role
 *               permissionId:
 *                 type: integer
 *                 description: The ID of the permission
 *             example:
 *               roleId: 1
 *               permissionId: 1
 *     responses:
 *       201:
 *         description: Role-permission created successfully
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
 *                   $ref: '#/components/schemas/RolePermission'
 *       400:
 *         description: Validation failed or duplicate association
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
router.post("/", createRolePermission);

/**
 * @swagger
 * /role-permissions/{id}:
 *   get:
 *     summary: Get a role-permission by ID
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The role-permission ID
 *     responses:
 *       200:
 *         description: Role-permission retrieved successfully
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
 *                   $ref: '#/components/schemas/RolePermission'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Role-permission not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getRolePermissionById);

/**
 * @swagger
 * /role-permissions:
 *   get:
 *     summary: Get all role-permissions
 *     tags: [RolePermissions]
 *     responses:
 *       200:
 *         description: Role-permissions retrieved successfully
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
 *                     $ref: '#/components/schemas/RolePermission'
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllRolePermissions);

/**
 * @swagger
 * /role-permissions/{id}:
 *   put:
 *     summary: Update a role-permission by ID
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The role-permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: The new role ID (optional)
 *               permissionId:
 *                 type: integer
 *                 description: The new permission ID (optional)
 *             example:
 *               roleId: 2
 *               permissionId: 3
 *     responses:
 *       200:
 *         description: Role-permission updated successfully
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
 *                   $ref: '#/components/schemas/RolePermission'
 *       400:
 *         description: Validation failed or duplicate association
 *       404:
 *         description: Role-permission not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", updateRolePermission);

/**
 * @swagger
 * /role-permissions/{id}:
 *   delete:
 *     summary: Delete a role-permission by ID
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The role-permission ID
 *     responses:
 *       200:
 *         description: Role-permission deleted successfully
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
 *         description: Role-permission not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteRolePermission);

export default router;
