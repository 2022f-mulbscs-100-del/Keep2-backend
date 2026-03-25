import express from "express";
import * as NotesController from "../Controllers/Notes/NotesController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";

// --------------------  Notes Routes --------------------
const route = express.Router();
logger.info("NotesRoute initialized");

// --------------------  GET ALL NOTES --------------------
/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes for the authenticated user
 *     description: Returns all notes created by the authenticated user and notes shared with the user as a collaborator.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 12
 *                   title:
 *                     type: string
 *                     example: Meeting Notes
 *                   content:
 *                     type: string
 *                     example: Discuss project roadmap
 *                   userId:
 *                     type: integer
 *                     example: 5
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   collaborators:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         collaborator:
 *                           type: string
 *                           example: user@email.com
 *                         noteId:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 */

route.get("/notes", VerifyToken, NotesController.getNotes);

// --------------------  CREATE NOTE --------------------
/**
 * @swagger
 * /addnotes:
 *   post:
 *     summary: Create a new note
 *     description: Creates a new note for the authenticated user. Client provides unique ID.
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
 *               - id
 *               - title
 *               - description
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Unique client-generated ID
 *                 example: 12345
 *               title:
 *                 type: string
 *                 example: Grocery List
 *               description:
 *                 type: string
 *                 example: Buy milk and bread
 *               pinned:
 *                 type: boolean
 *                 example: false
 *               category:
 *                 type: string
 *                 example: personal
 *               catgeory:
 *                 type: string
 *                 description: (Deprecated - use category instead)
 *                 example: personal
 *               list:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["milk", "bread", "eggs"]
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 pinned:
 *                   type: boolean
 *                 category:
 *                   type: string
 *                 list:
 *                   type: array
 *                   items:
 *                     type: string
 *                 userId:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */

route.post("/addnotes", VerifyToken, NotesController.createNote);

// --------------------  DELETE NOTE --------------------
/**
 * @swagger
 * /deleteNotes:
 *   delete:
 *     summary: Permanently delete all soft-deleted notes
 *     description: Deletes all notes that are marked as `isDeleted = true` for the authenticated user.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Note Deleted
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

route.delete("/deleteNotes", VerifyToken, NotesController.deleteNotes);

// --------------------  DELETE NOTE BY ID --------------------
/**
 * @swagger
 * /deleteNotes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     description: Permanently deletes a specific note using its ID.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the note to delete
 *         schema:
 *           type: integer
 *           example: 12
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
 *                   example: Note deleted successfully
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

route.delete("/deleteNotes/:id", VerifyToken, NotesController.deleteNotesById);

// --------------------  UPDATE NOTE BY ID --------------------
/**
 * @swagger
 * /updateNotes/{id}:
 *   put:
 *     summary: Update a note by ID
 *     description: Updates an existing note including title, description, pinned status, archive status, images, and background color.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the note to update
 *         schema:
 *           type: integer
 *           example: 15
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated meeting notes
 *               description:
 *                 type: string
 *                 example: Discussed product roadmap
 *               pinned:
 *                 type: boolean
 *                 example: true
 *               isDeleted:
 *                 type: boolean
 *                 example: false
 *               isArchived:
 *                 type: boolean
 *                 example: false
 *               imageUrl:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.png"]
 *               bgColor:
 *                 type: string
 *                 example: "#ffffff"
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 pinned:
 *                   type: boolean
 *                 isDeleted:
 *                   type: boolean
 *                 isArchived:
 *                   type: boolean
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                 bgColor:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
route.put("/UpdateNotes/:id", VerifyToken, NotesController.updateNotes);

//--------------------  GET NOTE BY ID --------------------
/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     description: Retrieves a specific note along with its collaborators.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the note to retrieve
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                   example: Meeting Notes
 *                 description:
 *                   type: string
 *                   example: Discussed project roadmap
 *                 pinned:
 *                   type: boolean
 *                 isDeleted:
 *                   type: boolean
 *                 isArchived:
 *                   type: boolean
 *                 bgColor:
 *                   type: string
 *                   example: "#ffffff"
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                 collaborators:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       collaborator:
 *                         type: string
 *                         example: user@email.com
 *                       noteId:
 *                         type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */

route.get("/notes/:id", VerifyToken, NotesController.getNotesById);

//---------------------  GET DELETED NOTES --------------------
/**
 * @swagger
 * /deletedNotes:
 *   get:
 *     summary: Get all deleted notes
 *     description: Retrieves all notes that are marked as deleted (isDeleted = true) for the authenticated user.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 15
 *                   title:
 *                     type: string
 *                     example: Old meeting notes
 *                   description:
 *                     type: string
 *                     example: Notes from last week's meeting
 *                   pinned:
 *                     type: boolean
 *                   isDeleted:
 *                     type: boolean
 *                     example: true
 *                   isArchived:
 *                     type: boolean
 *                   bgColor:
 *                     type: string
 *                     example: "#ffffff"
 *                   image:
 *                     type: array
 *                     items:
 *                       type: string
 *                   userId:
 *                     type: integer
 *                     example: 3
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

route.get("/deletedNotes", VerifyToken, NotesController.getDeletedNotes);

//---------------------  GET ARCHIVED NOTES ---------------------
/**
 * @swagger
 * /notes/archived:
 *   get:
 *     summary: Get all archived notes
 *     description: Retrieves all notes that are archived (`isArchived = true`) and not deleted (`isDeleted = false`) for the authenticated user.
 *     tags:
 *       - Notes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Archived notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 21
 *                   title:
 *                     type: string
 *                     example: Archived note title
 *                   description:
 *                     type: string
 *                     example: Notes from previous project
 *                   pinned:
 *                     type: boolean
 *                   isDeleted:
 *                     type: boolean
 *                     example: false
 *                   isArchived:
 *                     type: boolean
 *                     example: true
 *                   bgColor:
 *                     type: string
 *                     example: "#f0f0f0"
 *                   image:
 *                     type: array
 *                     items:
 *                       type: string
 *                   userId:
 *                     type: integer
 *                     example: 3
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

route.get("/archivedNotes", VerifyToken, NotesController.getArchivedNotes);

//---------------------  GET REMINDER NOTES ---------------------
/**
 * @swagger
 * /createReminder:
 *   post:
 *     summary: Create a reminder for a note
 *     description: Creates a reminder for a specific note. Supports one-time or recurring reminders.
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
 *                 description: Required for one-time or recurring reminders
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 noteId:
 *                   type: integer
 *                   example: 12
 *                 userId:
 *                   type: integer
 *                   example: 3
 *                 reminderTitle:
 *                   type: string
 *                   example: Weekly team meeting
 *                 remainderTime:
 *                   type: string
 *                   example: "10:00"
 *                 repeatReminder:
 *                   type: string
 *                   nullable: true
 *                   example: weekly
 *                 nextReminderDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-17T10:00:00.000Z"
 *                 reminderStatus:
 *                   type: boolean
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
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
 *     summary: Get all reminder notes for logged-in user
 *     description: Retrieves all reminders created by the authenticated user along with their associated notes (only notes that are not deleted).
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
 *                     example: 5
 *                   noteId:
 *                     type: integer
 *                     example: 12
 *                   userId:
 *                     type: integer
 *                     example: 3
 *                   reminderTitle:
 *                     type: string
 *                     example: Weekly team meeting
 *                   remainderTime:
 *                     type: string
 *                     example: "10:00"
 *                   repeatReminder:
 *                     type: string
 *                     nullable: true
 *                     example: weekly
 *                   nextReminderDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-01-17T10:00:00.000Z"
 *                   reminderStatus:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   note:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       title:
 *                         type: string
 *                         example: Weekly team meeting notes
 *                       description:
 *                         type: string
 *                         example: Discuss project roadmap
 *                       pinned:
 *                         type: boolean
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       isArchived:
 *                         type: boolean
 *                       bgColor:
 *                         type: string
 *                         example: "#ffffff"
 *                       image:
 *                         type: array
 *                         items:
 *                           type: string
 *                       userId:
 *                         type: integer
 *                         example: 3
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

route.get("/getRemainderNotes", VerifyToken, NotesController.getRemainderNotes);

//---------------------  GET REMAINDER NOTE BY ID ---------------------
/**
 * @swagger
 * /api/remainder-notes/{noteId}:
 *   get:
 *     summary: Get a specific remainder note by its associated note ID
 *     description: Fetches remainder notes for a given noteId that belong to the authenticated user. Only includes associated notes that are not deleted.
 *     tags:
 *       - RemainderNotes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the note to fetch remainder notes for
 *     responses:
 *       200:
 *         description: Remainder notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   noteId:
 *                     type: integer
 *                     example: 12
 *                   userId:
 *                     type: integer
 *                     example: 3
 *                   reminderTitle:
 *                     type: string
 *                     example: Weekly team meeting
 *                   remainderTime:
 *                     type: string
 *                     example: "10:00"
 *                   repeatReminder:
 *                     type: string
 *                     nullable: true
 *                     example: weekly
 *                   nextReminderDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-01-17T10:00:00.000Z"
 *                   reminderStatus:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   note:
 *                     type: object
 *                     description: Associated note object (only if not deleted)
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       title:
 *                         type: string
 *                         example: Weekly team meeting notes
 *                       description:
 *                         type: string
 *                         example: Discuss project roadmap
 *                       pinned:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       isArchived:
 *                         type: boolean
 *                         example: false
 *                       bgColor:
 *                         type: string
 *                         example: "#ffffff"
 *                       image:
 *                         type: array
 *                         items:
 *                           type: string
 *                       userId:
 *                         type: integer
 *                         example: 3
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: No remainder notes found for the given noteId and user
 *       500:
 *         description: Internal server error
 */

route.get(
  "/remainder-notes/:noteId",
  VerifyToken,
  NotesController.getRemainderNoteById
);

//---------------------  UPDATE REMAINDER NOTE ---------------------
/**
 * @swagger
 * /api/remainder-notes/update/{remainderId}:
 *   put:
 *     summary: Update a remainder note
 *     description: Updates an existing remainder note for the authenticated user. Only the fields provided in the request body will be updated.
 *     tags:
 *       - RemainderNotes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: remainderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the remainder note to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the reminder
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Updated date of the next reminder (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 format: time
 *                 description: Updated reminder time (HH:mm)
 *               repeat:
 *                 type: string
 *                 nullable: true
 *                 enum: [daily, weekly, monthly, yearly]
 *                 description: Updated repeat pattern for the reminder (null for one-time)
 *     responses:
 *       200:
 *         description: Remainder note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 noteId:
 *                   type: integer
 *                   example: 12
 *                 userId:
 *                   type: integer
 *                   example: 3
 *                 reminderTitle:
 *                   type: string
 *                   example: Weekly team meeting
 *                 nextReminderDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-17T10:00:00.000Z"
 *                 remainderTime:
 *                   type: string
 *                   example: "10:00"
 *                 repeatReminder:
 *                   type: string
 *                   nullable: true
 *                   example: weekly
 *                 reminderStatus:
 *                   type: boolean
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, user not authenticated
 *       404:
 *         description: Remainder note not found
 *       500:
 *         description: Internal server error
 */

route.put(
  "/remainder-notes/update/:remainderId",
  VerifyToken,
  NotesController.updateRemainder
);

//--------------------  LABEL CATEGORIES --------------------
/**
 * @swagger
 * /api/label-categories:
 *   post:
 *     summary: Create a new label category
 *     description: Creates a label category for the authenticated user.
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
 *                 example: Work
 *               colorCode:
 *                 type: string
 *                 example: "#FF5733"
 *     responses:
 *       200:
 *         description: Label category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 categoryName:
 *                   type: string
 *                   example: Work
 *                 colorCode:
 *                   type: string
 *                   example: "#FF5733"
 *                 userId:
 *                   type: integer
 *                   example: 5
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-11T22:30:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-11T22:30:00.000Z"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
route.post(
  "/createLabelCategories",
  VerifyToken,
  NotesController.createLabelCategories
);

//--------------------  UPDATE LABEL CATEGORY --------------------
/**
 * @swagger
 * /api/label-categories:
 *   put:
 *     summary: Update a label category
 *     description: Update label category name or color. The category ID must be provided in the request body.
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
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the label category to update
 *               categoryName:
 *                 type: string
 *                 example: Personal
 *                 description: Updated name of the category
 *               colorCode:
 *                 type: string
 *                 example: "#3498DB"
 *                 description: Updated color code of the category
 *     responses:
 *       200:
 *         description: Label category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 categoryName:
 *                   type: string
 *                   example: Personal
 *                 colorCode:
 *                   type: string
 *                   example: "#3498DB"
 *                 userId:
 *                   type: integer
 *                   example: 5
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Label category not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

route.put(
  "/updateLabelCategories",
  VerifyToken,
  NotesController.updateLableCategories
);

//--------------------  DELETE LABEL CATEGORY --------------------
/**
 * @swagger
 * /api/label-categories/{id}:
 *   delete:
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
 *         description: ID of the label category to delete
 *     responses:
 *       200:
 *         description: Label category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Label Category deleted successfully
 *       404:
 *         description: Label category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Label Category not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

route.get(
  "/deleteLabelCategories/:id",
  VerifyToken,
  NotesController.deleteLabelCategory
);

//--------------------  GET ALL LABEL CATEGORIES --------------------
/**
 * @swagger
 * /api/label-categories:
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
 *                     example: 1
 *                   categoryName:
 *                     type: string
 *                     example: Work
 *                   colorCode:
 *                     type: string
 *                     example: "#FF5733"
 *                   userId:
 *                     type: integer
 *                     example: 5
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-03-11T22:30:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-03-11T22:30:00.000Z"
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

//---------------------  GET LABEL CATEGORY BY NAME WITH NOTES ---------------------
/**
 * @swagger
 * /api/label-categories/{title}:
 *   get:
 *     summary: Get label category by name with notes
 *     description: Fetch a label category by its title for the authenticated user. Also returns all non-deleted notes associated with the category.
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
 *         example: Work
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
 *                     example: 1
 *                   categoryName:
 *                     type: string
 *                     example: Work
 *                   colorCode:
 *                     type: string
 *                     example: "#FF5733"
 *                   userId:
 *                     type: integer
 *                     example: 5
 *                   notes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         title:
 *                           type: string
 *                           example: Meeting Notes
 *                         description:
 *                           type: string
 *                           example: Discussion points from meeting
 *                         isDeleted:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-03-11T22:30:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-03-11T22:30:00.000Z"
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
