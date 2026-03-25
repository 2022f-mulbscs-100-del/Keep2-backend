import express from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as UserController from "../Controllers/User/UserController.js";
import { logger } from "../utils/Logger.js";
// import { GeneralRateLimiter } from "../utils/RateLimiter.js";

const route = express.Router();
logger.info("UserRoute initialized");

// route.use(GeneralRateLimiter);

/**
 * @swagger
 * /api/userProfile:
 *   get:
 *     summary: Get logged-in user's profile
 *     description: Fetch the profile of the authenticated user. In development mode, it includes the associated Auth details excluding the password.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 auth:
 *                   type: object
 *                   description: Auth details (only in development, password excluded)
 *                   properties:
 *                     provider:
 *                       type: string
 *                       example: local
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized, user not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

route.get("/userProfile", VerifyToken, UserController.userProfile);

/**
 * @swagger
 * /updateProfile:
 *   patch:
 *     summary: Update user profile
 *     description: Update profile information of the authenticated user. Individual fields can be selectively updated.
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
 *               profileData:
 *                 type: object
 *                 description: Object containing fields to update
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   profileImage:
 *                     type: string
 *                     example: "https://example.com/avatar.png"
 *                   isTwoFaEnabled:
 *                     type: boolean
 *                     example: true
 *                   autoLogoutEnabled:
 *                     type: boolean
 *                     example: true
 *                   autoLogoutTime:
 *                     type: integer
 *                     description: Auto logout time in minutes
 *                     example: 15
 *                   MfaEnabled:
 *                     type: boolean
 *                     example: false
 *                   layout:
 *                     type: string
 *                     example: "dark"
 *                     enum: ["light", "dark"]
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: john@example.com
 *                 profileImage:
 *                   type: string
 *                   example: "https://example.com/avatar.png"
 *                 isTwoFaEnabled:
 *                   type: boolean
 *                   example: true
 *                 autoLogoutEnabled:
 *                   type: boolean
 *                   example: true
 *                 autoLogoutTime:
 *                   type: integer
 *                   example: 15
 *                 MfaEnabled:
 *                   type: boolean
 *                   example: false
 *                 layout:
 *                   type: string
 *                   example: "dark"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
route.patch("/updateProfile", VerifyToken, UserController.updateProfile);

/**
 * @swagger
 * /deleteProfile:
 *   delete:
 *     summary: Delete user profile
 *     description: Delete the profile of the authenticated user. Requires the user's password for verification. Deletes the user from the database and Stripe if configured.
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
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Current password of the user for verification
 *                 example: "userPassword123"
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
 *                   example: User profile deleted successfully
 *       400:
 *         description: Bad request - missing or invalid password
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

route.delete("/deleteProfile", VerifyToken, UserController.DeleteProfile);

/**
 * @swagger
 * /getUser/{email}:
 *   get:
 *     summary: Get user by email
 *     description: Fetch user details by email. Returns basic profile information including name, email, and profile image.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user to fetch
 *     responses:
 *       200:
 *         description: User found successfully
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
 *                   example: john.doe@example.com
 *                 profileImage:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/images/profile.jpg"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

route.get("/getUser/:email", UserController.getUserById);

export default route;
