import express from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import * as CollaboratorsController from "../Controllers/Collaborators/CollaboratorsController.js";

const route = express.Router();

/**
 * @swagger
 * /addCollaborator:
 *   post:
 *     summary: Add a collaborator to a note
 *     description: Adds a collaborator with a specific role to an existing note.
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
 *               - role
 *             properties:
 *               noteId:
 *                 type: integer
 *                 description: ID of the note
 *               collaborator:
 *                 type: integer
 *                 description: User ID of the collaborator
 *               role:
 *                 type: string
 *                 description: Role of the collaborator (viewer, editor, admin)
 *             example:
 *               noteId: 12
 *               collaborator: 5
 *               role: "editor"
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
 *                 collaborator:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
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
 * /getCollaborators/{noteId}:
 *   get:
 *     summary: Get collaborators of a note
 *     description: Fetch all collaborators associated with a specific note.
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
 *                 collaborators:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       noteId:
 *                         type: integer
 *                       collaborator:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
route.get(
  "/getCollaborators/:noteId",
  VerifyToken,
  CollaboratorsController.getCollaborators
);

/**
 * @swagger
 * /deleteCollaborator:
 *   delete:
 *     summary: Remove a collaborator from a note
 *     description: Delete a collaborator's access to a specific note.
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
 *               - collaboratorId
 *             properties:
 *               collaboratorId:
 *                 type: integer
 *                 description: ID of the collaboration record to delete
 *             example:
 *               collaboratorId: 1
 *     responses:
 *       200:
 *         description: Collaborator removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Collaboration record not found
 *       500:
 *         description: Internal server error
 */
route.delete(
  "/deleteCollaborator",
  VerifyToken,
  CollaboratorsController.deleteCollaborator
);

export default route;
