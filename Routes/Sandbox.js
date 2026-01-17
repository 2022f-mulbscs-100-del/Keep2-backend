import express from "express";
import {
  deleteSandbox,
  generateSandbox,
} from "../Controllers/Sandbox/SandboxController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const Sandboxroute = express.Router();
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

/** * @swagger
 * /deleteSandbox:
 *   delete:
 *     summary: Delete sandbox data
 *     description: Delete sandbox data for the authenticated user.
 *     tags:
 *       - Sandbox
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sandbox data deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

Sandboxroute.delete("/deleteSandbox", VerifyToken, deleteSandbox);
export default Sandboxroute;
