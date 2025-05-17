import express from "express";
import {
  getAllPackageList,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackage,
} from "../../../controllers/moneyController/package.controller";
import { isAdmin } from "../../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Basic Package"
 *         type:
 *           type: string
 *           enum: [CHARGE, BUY_SUBCRIPTION, BUY_PRODUCT]
 *           example: "CHARGE"
 *         price:
 *           type: number
 *           example: 99.99
 *         description:
 *           type: string
 *           example: "Basic package with essential features"
 *         bonus:
 *           type: number
 *           example: 10
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - type
 *         - price

 *     PackageInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Basic Package"
 *         type:
 *           type: string
 *           enum: [CHARGE, BUY_SUBCRIPTION, BUY_PRODUCT]
 *           example: "CHARGE"
 *         price:
 *           type: number
 *           example: 99.99
 *         description:
 *           type: string
 *           example: "Basic package with essential features"
 *         bonus:
 *           type: number
 *           example: 10
 *       required:
 *         - name
 *         - description
 *         - type
 *         - price
 *         - bonus
 */

/**
 * @swagger
 * /packages:
 *   get:
 *     tags:
 *       - Packages
 *     summary: Get all packages
 *     description: Retrieve a list of all packages
 *     responses:
 *       200:
 *         description: Successfully retrieved packages
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
 *                   example: Packages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Package'
 *       500:
 *         description: Internal server error
 */
router.get("/", isAdmin, getAllPackageList);

/**
 * @swagger
 * /packages/{id}:
 *   get:
 *     tags:
 *       - Packages
 *     summary: Get package by ID
 *     description: Retrieve a specific package by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Successfully retrieved package
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
 *                   example: Package retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", isAdmin, getPackageById);

/**
 * @swagger
 * /packages:
 *   post:
 *     tags:
 *       - Packages
 *     summary: Create a new package
 *     description: Create a new package with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageInput'
 *     responses:
 *       201:
 *         description: Package created successfully
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
 *                   example: Package created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post("/", isAdmin, createPackage);

/**
 * @swagger
 * /packages/{id}:
 *   put:
 *     tags:
 *       - Packages
 *     summary: Update a package
 *     description: Update an existing package by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageInput'
 *     responses:
 *       200:
 *         description: Package updated successfully
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
 *                   example: Package updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", isAdmin, updatePackage);

/**
 * @swagger
 * /packages/{id}:
 *   delete:
 *     tags:
 *       - Packages
 *     summary: Delete a package
 *     description: Soft delete a package by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package deleted successfully
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
 *                   example: Package deleted successfully
 *       404:
 *         description: Package not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", isAdmin, deletePackage);

/**
 * @swagger
 * /packages/search:
 *   get:
 *     tags:
 *       - Packages
 *     summary: Search packages
 *     description: Search packages by name and type with pagination
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CHARGE, BUY_SUBCRIPTION, BUY_PRODUCT]
 *         description: Package type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully searched packages
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
 *                   example: Packages searched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Package'
 *       500:
 *         description: Internal server error
 */
router.get("/search", isAdmin, searchPackage);

export default router;
