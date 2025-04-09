// src/routes/userRoutes.ts
import express from "express";
import { getAllUsers } from "../../controllers/user.controller";

const router = express.Router();

/**
 * @swagger
 * /api/client/users:
 *   get:
 *     summary: Get all users
 *     tags: [Client Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: john_doe
 *                   email:
 *                     type: string
 *                     example: john.doe@example.com
 *                   roleId:
 *                     type: integer
 *                     example: 1
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-04-09T12:00:00.000Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-04-09T12:00:00.000Z
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/", getAllUsers);

router.get("/profile", (req, res) => {
    res.json({ id: "1", name: "Client User" });
  });
export default router;
