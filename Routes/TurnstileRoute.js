import express from "express";
import { verifyTurnstileToken } from "../Controllers/TurnstileController.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("TurnstileRoute initialized");

/**
 * @swagger
 * /turnstile-verify:
 *   post:
 *     summary: Verify Turnstile token
 *     description: Verify the Turnstile CAPTCHA token provided by the client during signup or login.
 *     tags:
 *       - Security
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
 *                 description: The Turnstile CAPTCHA token to verify
 *                 example: "0.xxxxxxxxxx"
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
 *                   example: true
 *       400:
 *         description: Bad Request - Invalid or missing token
 *       500:
 *         description: Verification failed
 */

route.post("/turnstile-verify", verifyTurnstileToken);

export default route;
