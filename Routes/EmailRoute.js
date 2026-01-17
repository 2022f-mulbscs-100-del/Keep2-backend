import express from "express";
import { EmailController } from "../Controllers/Email/EmailController.js";

const route = express.Router();

/** * @swagger
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
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Bad Request - Invalid input data
 */
route.post("/send-email", EmailController);

export default route;
