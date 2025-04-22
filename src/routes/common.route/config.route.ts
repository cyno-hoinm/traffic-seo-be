import express from "express";
import { authorization } from "../../middleware/auth";
import {
  createConfig,
  deleteConfig,
  getAllConfigs,
  getConfigById,
  getConfigByName,
  updateConfig,
} from "../../controllers/commonController/config.controller";

const router = express.Router();

/**
 * @swagger
 * /configs:
 *   get:
 *     summary: Get all configs
 *     description: Retrieve a list of all configs.
 *     tags: [Configs]
 *     responses:
 *       200:
 *         description: Configs retrieved successfully
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
 *                   example: Configs retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: site_title
 *                       value:
 *                         type: string
 *                         example: My Website
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-09T07:00:00
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-04-09T07:00:00
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
 *                   example: Error fetching configs
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/", authorization(["read-config"]), getAllConfigs);

/**
 * @swagger
 * /configs:
 *   post:
 *     summary: Create a new config
 *     description: Create a new config with required name and value fields.
 *     tags: [Configs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - value
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the config
 *                 example: site_title
 *               value:
 *                 type: string
 *                 description: Value of the config
 *                 example: My Website
 *     responses:
 *       201:
 *         description: Config created successfully
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
 *                   example: Config created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: site_title
 *                     value:
 *                       type: string
 *                       example: My Website
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *       400:
 *         description: Bad request - Missing required fields or duplicate config name
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
 *                   example: Name and value are required
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *               examples:
 *                 missingFields:
 *                   summary: Missing required fields
 *                   value:
 *                     status: false
 *                     message: Name and value are required
 *                     error: Missing required fields
 *                 duplicateName:
 *                   summary: Duplicate config name
 *                   value:
 *                     status: false
 *                     message: Config with this name already exists
 *                     error: Duplicate config name
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
 *                   example: Error creating config
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.post("/", authorization(["create-config"]), createConfig);

/**
 * @swagger
 * /configs/{id}:
 *   get:
 *     summary: Get a config by ID
 *     description: Retrieve a specific config by its ID.
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Config ID
 *     responses:
 *       200:
 *         description: Config retrieved successfully
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
 *                   example: Config retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: site_title
 *                     value:
 *                       type: string
 *                       example: My Website
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *       404:
 *         description: Config not found
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
 *                   example: Config not found
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
 *                   example: Error fetching config
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/:id", authorization(["read-config"]), getConfigById);

/**
 * @swagger
 * /configs/name/{name}:
 *   get:
 *     summary: Get a config by name
 *     description: Retrieve a specific config by its name.
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Config name
 *     responses:
 *       200:
 *         description: Config retrieved successfully
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
 *                   example: Config retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: site_title
 *                     value:
 *                       type: string
 *                       example: My Website
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *       404:
 *         description: Config not found
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
 *                   example: Config not found
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
 *                   example: Error fetching config
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.get("/name/:name", authorization(["read-config"]), getConfigByName);

/**
 * @swagger
 * /configs/{id}:
 *   put:
 *     summary: Update a config
 *     description: Update an existing config by its ID with new name or value.
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Config ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the config
 *                 example: site_title
 *               value:
 *                 type: string
 *                 description: New value of the config
 *                 example: New Website
 *     responses:
 *       200:
 *         description: Config updated successfully
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
 *                   example: Config updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: site_title
 *                     value:
 *                       type: string
 *                       example: New Website
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-09T07:00:00
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-10T07:00:00
 *       400:
 *         description: Bad request - Missing required fields or duplicate config name
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
 *                   example: At least one field (name or value) is required
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *               examples:
 *                 missingFields:
 *                   summary: Missing required fields
 *                   value:
 *                     status: false
 *                     message: At least one field (name or value) is required
 *                     error: Missing required fields
 *                 duplicateName:
 *                   summary: Duplicate config name
 *                   value:
 *                     status: false
 *                     message: Config with this name already exists
 *                     error: Duplicate config name
 *       404:
 *         description: Config not found
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
 *                   example: Config not found
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
 *                   example: Error updating config
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.put("/:id", authorization(["update-config"]), updateConfig);

/**
 * @swagger
 * /configs/{id}:
 *   delete:
 *     summary: Delete a config
 *     description: Delete a specific config by its ID.
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Config ID
 *     responses:
 *       200:
 *         description: Config deleted successfully
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
 *                   example: Config deleted successfully
 *       404:
 *         description: Config not found
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
 *                   example: Config not found
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
 *                   example: Error deleting config
 *                 error:
 *                   type: string
 *                   example: Database error
 */
router.delete("/:id", authorization(["delete-config"]), deleteConfig);

export default router;