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
 *     summary: Generate sandbox data
 *     description: Generate sandbox data for the authenticated user.
 *     tags:
 *       - Sandbox
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
 *               count:
 *                 type: number
 *               userID:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sandbox data generated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

Sandboxroute.post("/generateSandbox", VerifyToken, generateSandbox);
Sandboxroute.delete("/deleteSandbox", VerifyToken, deleteSandbox);
export default Sandboxroute;
