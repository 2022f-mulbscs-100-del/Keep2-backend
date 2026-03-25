import express from "express";
import {
  deleteSandbox,
  generateSandbox,
} from "../Controllers/SandboxController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";

const Sandboxroute = express.Router();

logger.info("SandboxRoute initialized");

/**
 * @swagger
 * /generateSandbox:
 *   post:
 *     summary: Generate sandbox notes
 *     description: Generate test notes for the authenticated user. Notes will have random titles, descriptions, and pinned status depending on `useRandomData`.
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
 *               - numNotes
 *             properties:
 *               numNotes:
 *                 type: integer
 *                 description: Number of notes to generate (1-100)
 *                 example: 10
 *               useRandomData:
 *                 type: boolean
 *                 description: If true, randomize note content and pinned status
 *                 example: true
 *     responses:
 *       201:
 *         description: Notes generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Generated 10 Notes Successfully
 *                 notes:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request, invalid `numNotes` or missing `numNotes`
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

Sandboxroute.post("/generateSandbox", VerifyToken, generateSandbox);

/**
 * @swagger
 * /deleteSandbox:
 *   delete:
 *     summary: Delete all sandbox notes
 *     description: Delete all notes created by the authenticated user in the sandbox.
 *     tags:
 *       - Sandbox
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sandbox notes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deleted Notes Successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

Sandboxroute.delete("/deleteSandbox", VerifyToken, deleteSandbox);

export default Sandboxroute;
