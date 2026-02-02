import express from "express";
import * as NotesController from "../Controllers/Notes/NotesController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("NotesRoute initialized");

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     description: Retrieve all notes belonging to the authenticated user.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized, invalid token
 */
route.get("/notes", VerifyToken, NotesController.getNotes);

/**
 * @swagger
 * /addnotes:
 *   post:
 *     summary: Create a new note
 *     description: Create a new note for the authenticated user.
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
 *                 description: Note title
 *               content:
 *                 type: string
 *                 description: Note content/body
 *             example:
 *               title: "My First Note"
 *               content: "This is the content of my note"
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *       400:
 *         description: Invalid input, missing required fields
 *       401:
 *         description: Unauthorized, invalid token
 */
route.post("/addnotes", VerifyToken, NotesController.createNote);

/**
 * @swagger
 * /deleteNotes:
 *   delete:
 *     summary: Delete all notes
 *     description: Delete all notes belonging to the authenticated user. Use with caution.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notes deleted successfully"
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */
route.delete("/deleteNotes", VerifyToken, NotesController.deleteNotes);

/**
 * @swagger
 * /deleteNotes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     description: Delete a specific note belonging to the authenticated user.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized, invalid token
 */
route.delete("/deleteNotes/:id", VerifyToken, NotesController.deleteNotesById);

/**
 * @swagger
 * /UpdateNotes/{id}:
 *   put:
 *     summary: Update a note by ID
 *     description: Update a specific note's title and/or content.
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
 *                 description: Updated note title
 *               content:
 *                 type: string
 *                 description: Updated note content
 *             example:
 *               title: "Updated Title"
 *               content: "Updated content here"
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized, invalid token
 */
route.put("/UpdateNotes/:id", VerifyToken, NotesController.updateNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     description: Retrieve a specific note by its ID.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized, invalid token
 */
route.get("/notes/:id", VerifyToken, NotesController.getNotesById);

/**
 * @swagger
 * /deletedNotes:
 *   get:
 *     summary: Get all deleted notes
 *     description: Retrieve all notes that have been deleted by the authenticated user.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of deleted notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized, invalid token
 */
route.get("/deletedNotes", VerifyToken, NotesController.getDeletedNotes);

/**
 * @swagger
 * /getArchivedNotes:
 *   get:
 *     summary: Get all archived notes
 *     description: Retrieve all notes that have been archived by the authenticated user.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized, invalid token
 */
route.get("/getArchivedNotes", VerifyToken, NotesController.getArchivedNotes);
/**
 * @swagger
 * /createReminder:
 *   post:
 *     summary: Create a reminder for a note
 *     tags:
 *       - Reminders
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
 *               - title
 *               - time
 *             properties:
 *               noteId:
 *                 type: integer
 *                 example: 12
 *               title:
 *                 type: string
 *                 example: Weekly team meeting
 *               date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: 2026-01-17
 *                 description: Required for one-time, weekly, monthly, yearly reminders
 *               time:
 *                 type: string
 *                 example: "10:00"
 *                 description: Reminder trigger time (HH:mm)
 *               repeat:
 *                 type: string
 *                 nullable: true
 *                 enum:
 *                   - daily
 *                   - weekly
 *                   - monthly
 *                   - yearly
 *                 example: weekly
 *                 description: |
 *                   null   → one-time reminder
 *                   daily  → every day at given time
 *                   weekly → every week on same weekday
 *                   monthly → every month on same date
 *                   yearly → every year on same date
 *     responses:
 *       200:
 *         description: Reminder created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
route.post("/createReminder", VerifyToken, NotesController.remindersNotes);

/**
 * @swagger
 * /getRemainderNotes:
 *   get:
 *     summary: Get all reminder notes
 *     description: Retrieve all reminder notes created by the authenticated user.
 *     tags:
 *       - Reminders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reminder notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   noteId:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *                   time:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
route.get("/getRemainderNotes", VerifyToken, NotesController.getRemainderNotes);

/**
 * @swagger
 * /remainder-notes/{noteId}:
 *   get:
 *     summary: Get reminders for a specific note
 *     description: Retrieve all reminder notes associated with a specific note ID.
 *     tags:
 *       - Reminders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the note to fetch reminders for
 *     responses:
 *       200:
 *         description: Reminder notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   noteId:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *                   time:
 *                     type: string
 *                   repeat:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No reminders found for the note
 *       500:
 *         description: Internal server error
 */
route.get(
  "/remainder-notes/:noteId",
  VerifyToken,
  NotesController.getRemainderNoteById
);

/**
 * @swagger
 * /remainder-notes/update/{remainderId}:
 *   put:
 *     summary: Update a reminder note
 *     description: Update an existing reminder note for the authenticated user.
 *     tags:
 *       - Reminders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: remainderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the reminder note to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Reminder title
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Reminder date
 *               time:
 *                 type: string
 *                 description: Reminder time (HH:mm)
 *               repeat:
 *                 type: string
 *                 enum: [none, daily, weekly, monthly, yearly]
 *                 description: Repeat pattern
 *     responses:
 *       200:
 *         description: Reminder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Internal server error
 */
route.put(
  "/remainder-notes/update/:remainderId",
  VerifyToken,
  NotesController.updateRemainder
);

/**
 * @swagger
 * /createLabelCategories:
 *   post:
 *     summary: Create a label category
 *     description: Create a new label category for organizing notes.
 *     tags:
 *       - Label Categories
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 description: Category name
 *               colorCode:
 *                 type: string
 *                 description: Hex color code for category
 *             example:
 *               categoryName: Work
 *               colorCode: "#FF5733"
 *     responses:
 *       201:
 *         description: Label category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 categoryName:
 *                   type: string
 *                 colorCode:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.post(
  "/createLabelCategories",
  VerifyToken,
  NotesController.createLabelCategories
);

/**
 * @swagger
 * /updateLabelCategories:
 *   put:
 *     summary: Update a label category
 *     description: Update label category name or color code.
 *     tags:
 *       - Label Categories
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 description: Updated category name
 *               colorCode:
 *                 type: string
 *                 description: Updated color code
 *             example:
 *               categoryName: Personal
 *               colorCode: "#3498DB"
 *     responses:
 *       200:
 *         description: Label category updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
route.put(
  "/updateLabelCategories",
  VerifyToken,
  NotesController.updateLableCategories
);

/**
 * @swagger
 * /deleteLabelCategories/{id}:
 *   get:
 *     summary: Delete a label category
 *     description: Delete a label category belonging to the authenticated user.
 *     tags:
 *       - Label Categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Label category ID to delete
 *     responses:
 *       200:
 *         description: Label category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
route.get(
  "/deleteLabelCategories/:id",
  VerifyToken,
  NotesController.deleteLabelCategory
);
/**
 * @swagger
 * /getLabelCategories:
 *   get:
 *     summary: Get all label categories
 *     description: Fetch all label categories created by the authenticated user.
 *     tags:
 *       - Label Categories
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Label categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   categoryName:
 *                     type: string
 *                   colorCode:
 *                     type: string
 *                   userId:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get(
  "/getLabelCategories",
  VerifyToken,
  NotesController.getLabelCategories
);

/**
 * @swagger
 * /getLabelCategoriesByCategoryName/{title}:
 *   get:
 *     summary: Get label category by name with notes
 *     description: Fetch a label category by its title for the authenticated user, including all associated non-deleted notes.
 *     tags:
 *       - Label Categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Label category title
 *     responses:
 *       200:
 *         description: Label category with associated notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   colorCode:
 *                     type: string
 *                   userId:
 *                     type: integer
 *                   notes:
 *                     type: array
 *                     items:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Label category not found
 *       500:
 *         description: Server error
 */
route.get(
  "/getLabelCategoriesByCategoryName/:title",
  VerifyToken,
  NotesController.getLabelCategoriesByCategoryName
);

export default route;
