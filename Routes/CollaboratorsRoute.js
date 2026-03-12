import express from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as CollaboratorsController from "../Controllers/Collaborators/CollaboratorsController.js";

const route = express.Router();

/**
 * @swagger
 * /api/collaborators:
 *   post:
 *     summary: Add a collaborator to a note
 *     description: >
 *       Adds a collaborator to a specific note. Sends an email to the collaborator with the note link.
 *       The collaborator user must exist. Owner information is stored in the note.
 *     tags:
 *       - Collaborators
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *               - collaborator
 *             properties:
 *               noteId:
 *                 type: integer
 *                 description: ID of the note to add the collaborator to
 *                 example: 12
 *               collaborator:
 *                 type: string
 *                 description: Email of the collaborator to add
 *                 example: john@example.com
 *               role:
 *                 type: string
 *                 description: Role of the collaborator (viewer by default)
 *                 example: editor
 *     responses:
 *       201:
 *         description: Collaborator added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collaborator added successfully
 *                 collaborator:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     noteId:
 *                       type: integer
 *                       example: 12
 *                     userId:
 *                       type: integer
 *                       example: 5
 *                     collaborator:
 *                       type: string
 *                       example: john@example.com
 *                     role:
 *                       type: string
 *                       example: viewer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-03-11T22:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-03-11T22:30:00.000Z"
 *       404:
 *         description: Collaborator user or owner not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

route.post(
  "/addCollaborator",
  VerifyToken,
  CollaboratorsController.addCollaborator
);

/**
 * @swagger
 * /api/collaborators/{noteId}:
 *   get:
 *     summary: Get all collaborators for a note
 *     description: Fetches all collaborators associated with a specific note.
 *     tags:
 *       - Collaborators
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the note
 *         example: 12
 *     responses:
 *       200:
 *         description: Collaborators fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collaborators fetched successfully
 *                 collaborators:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       noteId:
 *                         type: integer
 *                         example: 12
 *                       collaborator:
 *                         type: string
 *                         example: john@example.com
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-03-11T22:30:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-03-11T22:30:00.000Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

route.get(
  "/getCollaborators/:noteId",
  VerifyToken,
  CollaboratorsController.getCollaborators
);

/**
 * @swagger
 * /api/collaborators:
 *   delete:
 *     summary: Delete a collaborator from a note
 *     description: Deletes a collaborator from a specific note based on the noteId and collaborator email provided in the request body.
 *     tags:
 *       - Collaborators
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *               - collaborator
 *             properties:
 *               noteId:
 *                 type: integer
 *                 description: ID of the note from which to remove the collaborator
 *                 example: 12
 *               collaborator:
 *                 type: string
 *                 description: Email of the collaborator to remove
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Collaborator deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collaborator deleted successfully
 *       404:
 *         description: Collaborator not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collaborator not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

route.delete(
  "/deleteCollaborator",
  VerifyToken,
  CollaboratorsController.deleteCollaborator
);

export default route;
