import express from "express";
import {
  deleteSandbox,
  generateSandbox,
} from "../Controllers/SandboxController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";
import { GeneralRateLimiter } from "../utils/RateLimiter.js";

const Sandboxroute = express.Router();

logger.info("SandboxRoute initialized");

Sandboxroute.use(GeneralRateLimiter);

/**
 * @swagger
 * /generateSandbox:
 *   post:
 *     summary: Generate sandbox test data
 *     description: Generate sandbox data for testing purposes for the authenticated user.
 *     tags:
 *       - Sandbox
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userID
 *               - count
 *             properties:
 *               userID:
 *                 type: string
 *                 description: User ID for which to generate sandbox data
 *               count:
 *                 type: number
 *                 description: Number of sandbox records to generate
 *             example:
 *               userID: "user123"
 *               count: 10
 *     responses:
 *       200:
 *         description: Sandbox data generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
Sandboxroute.post("/generateSandbox", VerifyToken, generateSandbox);

/**
 * @swagger
 * /deleteSandbox:
 *   delete:
 *     summary: Delete sandbox test data
 *     description: Delete all sandbox test data for the authenticated user.
 *     tags:
 *       - Sandbox
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sandbox data deleted successfully
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
Sandboxroute.delete("/deleteSandbox", VerifyToken, deleteSandbox);

export default Sandboxroute;
