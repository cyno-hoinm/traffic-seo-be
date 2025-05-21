import { Router } from "express";
import {
  createReportController,
  getReportUserController,
  updateReportController,
} from "../../../controllers/commonController/report.controller";
import multer from "multer";
import { authorization } from "../../../middleware/auth";

const router = Router();
const upload = multer();

//swagger
/**
 * @swagger
 * tags:
 *   name: Report User
 *   description: Report management
 */

/**
 * @swagger
 * /report-user:
 *   post:
 *     summary: Create a new report
 *     tags: [Report User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Bad Request - No images provided
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/",
  authorization(["create-report-user"]),
  upload.array("images"),
  createReportController
);

/**
 * @swagger
 * /report-user/search:
 *   post:
 *     summary: Get a list of reports
 *     tags: [Report User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *               status:
 *                 type: string
 *               page:
 *                 type: number
 *               limit:
 *                 type: number
 *     responses:
 *       200:
 *         description: A list of reports
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/search",
  authorization(["search-report-user"]),
  getReportUserController
);

/**
 * @swagger
 * /report-user/{id}:
 *   patch:
 *     summary: Update the status of a report
 *     tags: [Report User]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - COMPLETED
 *                   - FAILED
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  "/:id",
  authorization(["update-report-user"]),
  updateReportController
);
export default router;
