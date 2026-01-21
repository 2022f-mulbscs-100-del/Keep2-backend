import express from "express";
import * as NotesController from "../Controllers/NotesController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("NotesRoute initialized");

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
 *     summary: Get all reminder notes for logged-in user
 *     tags:
 *       - Reminders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reminder notes fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

route.get("/getRemainderNotes", VerifyToken, NotesController.getRemainderNotes);

/**
 * @swagger
 * /api/remainder-notes/{noteId}:
 *   get:
 *     summary: Get a specific remainder note by its associated note ID
 *     description: Fetches remainder notes for a given noteId that belong to the authenticated user. Only includes associated notes that are not deleted.
 *     tags:
 *       - RemainderNotes
 *     security:
 *       - bearerAuth: []
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
 *                     description: ID of the remainder note
 *                   userId:
 *                     type: integer
 *                     description: ID of the user who owns the remainder note
 *                   noteId:
 *                     type: integer
 *                     description: ID of the associated note
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Scheduled date of the reminder
 *                   time:
 *                     type: string
 *                     description: Scheduled time of the reminder
 *                   repeat:
 *                     type: string
 *                     description: Repeat pattern for the reminder
 *                   note:
 *                     type: object
 *                     description: Associated note object (only if not deleted)
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the note
 *                       title:
 *                         type: string
 *                         description: Title of the note
 *                       content:
 *                         type: string
 *                         description: Content of the note
 *                       isDeleted:
 *                         type: boolean
 *                         description: Whether the note is deleted
 *       401:
 *         description: Unauthorized, user not authenticated
 *       404:
 *         description: No remainder notes found for the given noteId
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
 * /api/remainder-notes/update/{remainderId}:
 *   put:
 *     summary: Update a remainder note
 *     description: Updates an existing remainder note for the authenticated user. Only the fields provided in the request body will be updated.
 *     tags:
 *       - RemainderNotes
 *     security:
 *       - bearerAuth: []
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
 *                 description: The title of the reminder
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the next reminder (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 format: time
 *                 description: The time of the reminder (HH:mm)
 *               repeat:
 *                 type: string
 *                 enum: [none, daily, weekly, monthly, yearly]
 *                 description: The repeat pattern for the reminder
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
 *                   description: ID of the remainder note
 *                 noteId:
 *                   type: integer
 *                   description: ID of the associated note
 *                 userId:
 *                   type: integer
 *                   description: ID of the user who owns the reminder
 *                 reminderTitle:
 *                   type: string
 *                   description: Updated title of the reminder
 *                 nextReminderDate:
 *                   type: string
 *                   format: date-time
 *                   description: Updated next reminder date and time
 *                 remainderTime:
 *                   type: string
 *                   description: Updated reminder time
 *                 repeatReminder:
 *                   type: string
 *                   description: Updated repeat pattern
 *                 reminderStatus:
 *                   type: boolean
 *                   description: Whether the reminder has been triggered
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

/**
 * @swagger
 * /api/label-categories:
 *   post:
 *     summary: Create a new label category
 *     description: Create a label category for the authenticated user
 *     tags: [Label Categories]
 *     security:
 *       - bearerAuth: []
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
 *       201:
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
 * /api/label-categories/{id}:
 *   put:
 *     summary: Update a label category
 *     description: Update label category name or color
 *     tags: [Label Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Label category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Personal
 *               colorCode:
 *                 type: string
 *                 example: "#3498DB"
 *     responses:
 *       200:
 *         description: Label category updated successfully
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

/**
 * @swagger
 * /api/label-categories/{id}:
 *   delete:
 *     summary: Delete a label category
 *     description: Delete a label category belonging to the authenticated user
 *     tags: [Label Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Label category ID
 *     responses:
 *       200:
 *         description: Label category deleted successfully
 *       404:
 *         description: Label category not found
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
/**
 * @swagger
 * /api/label-categories:
 *   get:
 *     summary: Get all label categories
 *     description: Fetch all label categories created by the authenticated user
 *     tags: [Label Categories]
 *     security:
 *       - bearerAuth: []
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
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
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
 * /api/label-categories/{title}:
 *   get:
 *     summary: Get label category by name with notes
 *     description: >
 *       Fetch a label category by its title for the authenticated user.
 *       Also returns all non-deleted notes associated with the category.
 *     tags: [Label Categories]
 *     security:
 *       - bearerAuth: []
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
 *                   title:
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
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
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
