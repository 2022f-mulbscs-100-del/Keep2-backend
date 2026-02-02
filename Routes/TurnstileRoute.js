import express from "express";
import { verifyTurnstileToken } from "../Controllers/TurnstileController.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("TurnstileRoute initialized");

/**
 * @swagger
 * /turnstile-verify:
 *   post:
 *     summary: Verify Turnstile CAPTCHA token
 *     description: Verify a Turnstile CAPTCHA token provided by the client for bot protection.
 *     tags:
 *       - CAPTCHA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Turnstile token to verify
 *             example:
 *               token: "your-turnstile-token-here"
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
route.post("/turnstile-verify", verifyTurnstileToken);

export default route;
