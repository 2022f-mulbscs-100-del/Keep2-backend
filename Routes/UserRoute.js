import express from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as UserController from "../Controllers/User/UserController.js";
import { logger } from "../utils/Logger.js";
import { GeneralRateLimiter } from "../utils/RateLimiter.js";

const route = express.Router();
logger.info("UserRoute initialized");
route.use(GeneralRateLimiter);

/**
 * @swagger
 * /userProfile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile information of the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 profileImage:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
route.get("/userProfile", VerifyToken, UserController.userProfile);

/**
 * @swagger
 * /updateProfile:
 *   patch:
 *     summary: Update user profile
 *     description: Update the profile information of the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               profileImage:
 *                 type: string
 *                 description: Profile image URL
 *             example:
 *               name: "John Doe"
 *               email: "john@example.com"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       409:
 *         description: Email already in use
 */
route.patch("/updateProfile", VerifyToken, UserController.updateProfile);

/**
 * @swagger
 * /deleteProfile:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account and all associated data.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
route.delete("/deleteProfile", VerifyToken, UserController.DeleteProfile);
/**
 * @swagger
 * /getUser/{email}:
 *   get:
 *     summary: Get user by email
 *     description: Fetch a user's public profile information using their email address.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: User email address
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 profileImage:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
route.get("/getUser/:email", UserController.getUserById);

export default route;
