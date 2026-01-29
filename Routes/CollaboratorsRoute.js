import express from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as CollaboratorsController from "../Controllers/Collaborators/CollaboratorsController.js";

const route = express.Router();
/**
 * @swagger
 * /api/collaborators:
 *   post:
 *     summary: Add a collaborator to a note
 *     description: Adds a collaborator with a specific role to an existing note.
 *     tags:
 *       - Collaborators
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *               - collaborator
 *               - role
 *             properties:
 *               noteId:
 *                 type: integer
 *                 example: 12
 *               collaborator:
 *                 type: integer
 *                 description: User ID of the collaborator
 *                 example: 5
 *               role:
 *                 type: string
 *                 description: Role of the collaborator on the note
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
 *                     collaborator:
 *                       type: integer
 *                       example: 5
 *                     role:
 *                       type: string
 *                       example: editor
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Note not found
 *       500:
 *         description: Internal server error
 */

route.post(
  "/addCollaborator",
  VerifyToken,
  CollaboratorsController.addCollaborator
);

/**
 * @swagger
 * /api/notes/{noteId}/collaborators:
 *   get:
 *     summary: Get collaborators of a note
 *     description: Fetch all collaborators associated with a specific note.
 *     tags:
 *       - Collaborators
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
 *                         example: user@example.com
 *                       role:
 *                         type: string
 *                         example: editor
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Note not found or no collaborators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Note not found
 *       500:
 *         description: Internal server error
 */
route.get(
  "/getCollaborators/:noteId",
  VerifyToken,
  CollaboratorsController.getCollaborators
);

route.delete(
  "/deleteCollaborator",
  VerifyToken,
  CollaboratorsController.deleteCollaborator
);
export default route;
