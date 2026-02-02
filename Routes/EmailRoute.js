import express from "express";
import { EmailController } from "../Controllers/EmailController.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("EmailRoute initialized");

/**
 * @swagger
 * /send-email:
 *   post:
 *     summary: Send an email
 *     description: Send an email to a specified recipient.
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - body
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               body:
 *                 type: string
 *                 description: Email body content
 *             example:
 *               to: "recipient@example.com"
 *               subject: "Test Email"
 *               body: "This is a test email"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - Invalid input data
 *       500:
 *         description: Internal server error
 */
route.post("/send-email", EmailController);

export default route;
