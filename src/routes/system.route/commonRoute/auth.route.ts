import express from "express";
import {
  changePassword,
  confirmUser,
  getMe,
  loginUser,
  refreshToken,
  registerUser,
  resendOtp,
} from "../../../controllers/commonController/auth.controller";
import { authenticateToken } from "../../../middleware/auth";
import { getUserImage } from "../../../controllers/commonController/user.controller";

const router = express.Router();
/**
 * @swagger
 * /image/{id}:
 *   get:
 *     summary: Get a user image by ID
 *     tags: [Image]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to get the image
 *         example: 1
 *     responses:
 *       200:
 *         description: User image retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User image retrieved successfully
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid user ID
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
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
router.get("/image/:id", getUserImage);
/**
 * @swagger
 * /auth:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password, returning  JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: pass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request - Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Unauthorized - Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.post("/", loginUser);
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with the provided username, password, and email. Assigns a default roleId of 2. Returns the created user's details (excluding password). If the user registers using an invite, the inviteCode must be provided.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username (minimum 3 characters).
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 description: The user's password (minimum 6 characters).
 *                 example: hashedpassword123
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: john.doe@example.com
 *               inviteCode:
 *                 type: string
 *                 format: uuid
 *                 description: The invite code of agency
 *                 example: e08633b1-ddc3-499a-a798-e3d00a69c36f
 *     responses:
 *       200:
 *         description: User registered successfully
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john.doe@example.com
 *                     roleId:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-24T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-04-24T10:00:00.000Z
 *       400:
 *         description: Invalid input (e.g., missing or invalid username, password, or email)
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
 *                   example: Username is required and must be at least 3 characters
 *                 error:
 *                   type: string
 *                   example: Invalid field
 *       409:
 *         description: User creation failed due to existing email or username
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
 *                   example: User creation failed
 *                 error:
 *                   type: string
 *                   example: Email already exists
 *       500:
 *         description: Server error during user registration
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
 *                   example: Error registering user
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.post("/register", registerUser);
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Allows an authenticated user to change their password by providing the current password and a new password. The new password is hashed before updating.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password for verification.
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 description: The new password (minimum 6 characters).
 *                 example: newpassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid input (e.g., missing or invalid passwords)
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
 *                   example: New password is required and must be at least 6 characters
 *                 error:
 *                   type: string
 *                   example: Invalid field
 *       401:
 *         description: Incorrect current password
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
 *                   example: Incorrect current password
 *                 error:
 *                   type: string
 *                   example: Authentication failed
 *       404:
 *         description: User not found
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
 *                   example: User not found
 *                 error:
 *                   type: string
 *                   example: Resource not found
 *       500:
 *         description: Server error during password update
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
 *                   example: Error changing password
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.post("/change-password", authenticateToken, changePassword);
/**
 * @swagger
 * /auth/getMe:
 *   get:
 *     summary: Retrieve authenticated user details
 *     description: Returns the details of the currently authenticated user, including their ID and username, after verifying they have the required permissions.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     username:
 *                       type: string
 *                       example: john_doe
 *                   required:
 *                     - id
 *                     - username
 *               required:
 *                 - status
 *                 - message
 *                 - data
 *       401:
 *         description: Unauthorized - No user or invalid authentication
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
 *               required:
 *                 - status
 *                 - message
 *       403:
 *         description: Forbidden - Insufficient permissions or no permissions found
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
 *                   example: Insufficient permissions
 *               required:
 *                 - status
 *                 - message
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
 *                   example: Database connection failed
 *                   nullable: true
 *               required:
 *                 - status
 *                 - message
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get("/getMe", authenticateToken, getMe);
/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh an access token
 *     description: Refreshes an existing access token by validating it, blacklisting the old token, and issuing a new one. The token must be provided in the Authorization header as a Bearer token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: The new JWT access token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request - Access token is missing
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
 *                   example: Access token is required
 *       401:
 *         description: Unauthorized - Token is blacklisted or invalid/expired
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
 *                   example: Token is blacklisted
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
 *                   example: Something went wrong
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get("/refresh", authenticateToken, refreshToken);
/**
 * @swagger
 * /auth/confirm:
 *   post:
 *     summary: Confirm user email with OTP
 *     tags: [Authentication]
 *     description: Verifies a user's email by validating the provided OTP and updates `isDeleted` to false. Optionally updates the user's password if provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email for verification.
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 description: Optional new password for the user (minimum 6 characters).
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:

 *             example:
 *               status: true
 *               message: Email verified successfully
 *       400:
 *         description: Invalid input (e.g., missing email/OTP, invalid password)
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: Password, if provided, must be at least 6 characters
 *               error: Invalid field
 *       401:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: Invalid or expired OTP
 *               error: Authentication failed
 *       404:
 *         description: User not found
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: User not found
 *               error: Resource not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: Error verifying email
 *               error: Internal server error
 */
router.post("/confirm", confirmUser);
/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     tags: [Authentication]
 *     description: Resends a new OTP to the user's email for email verification. The user must exist and not be verified (isDeleted = true).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:

 *             example:
 *               status: true
 *               message: OTP resent successfully. Please check your email.
 *       400:
 *         description: Invalid input or user already verified
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: Valid email is required
 *               error: Invalid field
 *       404:
 *         description: User not found
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: User not found
 *               error: Resource not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:

 *             example:
 *               status: false
 *               message: Error resending OTP
 *               error: Internal server error
 */
router.post("/resend-otp", resendOtp);
export default router;
