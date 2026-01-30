import express from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as UserController from "../Controllers/User/UserController.js";
import { logger } from "../utils/Logger.js";
import { GeneralRateLimiter } from "../utils/RateLimiter.js";

const route = express.Router();
logger.info("UserRoute initialized");
route.use(GeneralRateLimiter);
/** * @swagger
 * /userProfile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile information of the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
route.get("/userProfile", VerifyToken, UserController.userProfile);

/** * @swagger
 * /updateProfile:
 *   patch:
 *     summary: Update user profile
 *     description: Update the profile information of the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
route.patch("/updateProfile", VerifyToken, UserController.updateProfile);

/** * @swagger
 * /deleteProfile:
 *   delete:
 *     summary: Delete user profile
 *     description: Delete the profile of the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
route.delete("/deleteProfile", VerifyToken, UserController.DeleteProfile);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by email
 *     description: Fetch a user's public profile information using their email address.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User email address
 *         schema:
 *           type: string
 *           example: user@example.com
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *                 profileImage:
 *                   type: string
 *                   example: https://cdn.example.com/avatar.png
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */

route.get("/getUser/:email", UserController.getUserById);
export default route;
