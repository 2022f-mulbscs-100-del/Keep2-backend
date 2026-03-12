import express from "express";
import { EmailController } from "../Controllers/EmailController.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("EmailRoute initialized");

/**
 * @swagger
 * /api/send-email:
 *   post:
 *     summary: Send an email via Brevo
 *     description: Sends an email using the Brevo SMTP API with a specific template and parameters.
 *     tags:
 *       - Email
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - templateId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *                 example: john@example.com
 *               name:
 *                 type: string
 *                 description: Recipient name
 *                 example: John Doe
 *               templateId:
 *                 type: integer
 *                 description: Brevo email template ID
 *                 example: 5
 *               params:
 *                 type: object
 *                 description: Key-value parameters to be replaced in the template
 *                 example:
 *                   noteLink: "https://example.com/notes/12"
 *                   email: "john@example.com"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       400:
 *         description: Bad request, missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

route.post("/send-email", EmailController);

export default route;
