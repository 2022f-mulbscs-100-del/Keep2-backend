import express from "express";
import * as NotesController from "../Controllers/Notes/NotesController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const route = express.Router();

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
route.get("/notes", VerifyToken, NotesController.getNotes);

/**
 * @swagger
 * /addnotes:
 *   post:
 *     summary: Create a new note
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
route.post("/addnotes", VerifyToken, NotesController.createNote);

/**
 * @swagger
 * /deleteNotes:
 *   delete:
 *     summary: Delete all notes
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notes deleted successfully
 *       401:
 *         description: Unauthorized
 */
route.delete("/deleteNotes", VerifyToken, NotesController.deleteNotes);

/**
 * @swagger
 * /deleteNotes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID to delete
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
route.delete("/deleteNotes/:id", VerifyToken, NotesController.deleteNotesById);

/**
 * @swagger
 * /UpdateNotes/{id}:
 *   put:
 *     summary: Update a note by ID
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
route.put("/UpdateNotes/:id", VerifyToken, NotesController.updateNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
route.get("/notes/:id", VerifyToken, NotesController.getNotesById);

/**
 * @swagger
 * /deletedNotes:
 *   get:
 *     summary: Get all deleted notes
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of deleted notes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
route.get("/deletedNotes", VerifyToken, NotesController.getDeletedNotes);

/**
 * @swagger
 * /getArchivedNotes:
 *   get:
 *     summary: Get all archived notes
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived notes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
route.get("/getArchivedNotes", VerifyToken, NotesController.getArchivedNotes);

export default route;
