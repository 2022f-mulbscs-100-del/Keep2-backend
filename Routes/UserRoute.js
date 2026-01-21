import exppress from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as UserController from "../Controllers/User/UserController.js";
import { logger } from "../utils/Logger.js";
const route = exppress.Router();
logger.info("UserRoute initialized");

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

export default route;
