import express from "express";
import { verifyTurnstileToken } from "../Controllers/Turnstile/TurnstileController.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("TurnstileRoute initialized");
/** * @swagger
 * /turnstile-verify:
 *   post:
 *     summary: Verify Turnstile token
 *     description: Verify the Turnstile token provided by the client.
 *     tags:
 *       - Turnstile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Turnstile token to verify.
 *     responses:
 *       200:
 *         description: Token verified successfully
 *       400:
 *         description: Bad Request - Invalid or missing token
 */
route.post("/turnstile-verify", verifyTurnstileToken);

export default route;
