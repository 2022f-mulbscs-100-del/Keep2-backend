/**
 * Notes Service
 * Contains all notes business logic
 */

import { Op } from "sequelize";
import Note from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import LabelCategories from "../../Modals/label_categories.modal.js";
import Collaborators from "../../Modals/collaborators.modal.js";
import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES } from "../../Constants/messages.js";

class NotesService {
  /**
   * Create a new note
   * @param {string} userId - User ID
   * @param {object} noteData - Note data (title, description, etc)
   * @returns {object} Created note
   */
  static async createNote(userId, noteData) {
    try {
      const note = await Note.create({
        ...noteData,
        userId,
        isDeleted: false,
        isArchived: false,
      });

      logger.info("Note created", {
        userId,
        noteId: note.id,
      });

      return note;
    } catch (error) {
      logger.error("Failed to create note", {
        userId,
        reason: error.message,
      });
      throw ErrorHandler(500, NOTE_MESSAGES.NOTE_CREATE_FAILED);
    }
  }

  /**
   * Get all notes for a user (owned + collaborated)
   * @param {string} userId - User ID
   * @returns {array} Array of notes
   */
  static async getNotesByUserId(userId) {
    try {
      // Get user to fetch email
      const user = await User.findByPk(userId);
      if (!user) {
        throw ErrorHandler(404, "User not found");
      }

      // Get notes where user is collaborator
      const collaboratorNotes = await Collaborators.findAll({
        where: { collaborator: user.email },
        attributes: ["noteId"],
      });

      // Fetch all notes (owned + collaborated)
      const notes = await Note.findAll({
        where: {
          [Op.or]: [
            { userId: userId },
            { id: { [Op.in]: collaboratorNotes.map((note) => note.noteId) } },
          ],
          isDeleted: false,
          isArchived: false,
        },
        include: [
          {
            model: Collaborators,
            as: "collaborators",
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return notes;
    } catch (error) {
      logger.error("Failed to fetch notes", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get note by ID with collaborators
   * @param {string} noteId - Note ID
   * @returns {object} Note object
   */
  static async getNoteById(noteId) {
    try {
      const note = await Note.findByPk(noteId, {
        include: [{ model: Collaborators, as: "collaborators" }],
      });

      return note;
    } catch (error) {
      logger.error("Failed to fetch note", {
        noteId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Update a note
   * @param {string} noteId - Note ID
   * @param {object} updateData - Data to update
   * @returns {object} Updated note
   */
  static async updateNote(noteId, updateData) {
    try {
      await Note.update(updateData, { where: { id: noteId } });

      const updatedNote = await this.getNoteById(noteId);

      logger.info("Note updated", { noteId });

      return updatedNote;
    } catch (error) {
      logger.error("Failed to update note", {
        noteId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete a note permanently
   * @param {string} noteId - Note ID
   */
  static async deleteNote(noteId) {
    try {
      await Note.destroy({ where: { id: noteId } });

      logger.info("Note deleted", { noteId });
    } catch (error) {
      logger.error("Failed to delete note", {
        noteId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Permanently delete all soft-deleted notes for a user
   * @param {string} userId - User ID
   */
  static async permanentlyDeleteAllNotes(userId) {
    try {
      await Note.destroy({ where: { isDeleted: true, userId } });

      logger.info("All soft-deleted notes permanently deleted", { userId });
    } catch (error) {
      logger.error("Failed to delete notes", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get deleted notes for a user
   * @param {string} userId - User ID
   * @returns {array} Array of deleted notes
   */
  static async getDeletedNotes(userId) {
    try {
      const notes = await Note.findAll({
        where: { userId, isDeleted: true },
        order: [["updatedAt", "DESC"]],
      });

      return notes;
    } catch (error) {
      logger.error("Failed to fetch deleted notes", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get archived notes for a user
   * @param {string} userId - User ID
   * @returns {array} Array of archived notes
   */
  static async getArchivedNotes(userId) {
    try {
      const notes = await Note.findAll({
        where: { userId, isArchived: true, isDeleted: false },
        order: [["createdAt", "DESC"]],
      });

      return notes;
    } catch (error) {
      logger.error("Failed to fetch archived notes", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Archive a note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   */
  static async archiveNote(userId, noteId) {
    try {
      const note = await Note.findOne({
        where: { id: noteId, userId },
      });

      if (!note) {
        throw ErrorHandler(404, NOTE_MESSAGES.NOTE_NOT_FOUND);
      }

      await note.update({ isArchived: true });

      logger.info("Note archived", {
        userId,
        noteId,
      });
    } catch (error) {
      logger.error("Failed to archive note", {
        userId,
        noteId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a reminder for a note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @param {object} reminderData - Reminder data (title, date, time, repeat)
   * @returns {object} Created reminder
   */
  static async createReminder(userId, noteId, reminderData) {
    try {
      const { title, date, time, repeat } = reminderData;
      const reminderDate = new Date(date);

      const reminderNote = await RemainderNotes.create({
        noteId,
        userId,
        reminderTitle: title,
        remainderTime: time,
        repeatReminder: repeat,
        nextReminderDate: reminderDate.toISOString(),
        reminderStatus: false,
      });

      // Mark note as having reminder
      const note = await Note.findByPk(noteId);
      if (note) {
        note.hasReminder = true;
        await note.save();
      }

      logger.info("Reminder created", {
        userId,
        noteId,
        reminderId: reminderNote.id,
      });

      return reminderNote;
    } catch (error) {
      logger.error("Failed to create reminder", {
        userId,
        noteId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all reminder notes for a user
   * @param {string} userId - User ID
   * @returns {array} Array of reminder notes
   */
  static async getReminderNotes(userId) {
    try {
      const reminderNotes = await RemainderNotes.findAll({
        where: { userId },
        include: [
          {
            model: Note,
            as: "note",
            where: { isDeleted: false },
          },
        ],
      });

      return reminderNotes;
    } catch (error) {
      logger.error("Failed to fetch reminder notes", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get reminders by note ID
   * @param {string} noteId - Note ID
   * @returns {array} Array of reminders
   */
  static async getRemindersByNoteId(noteId) {
    try {
      const reminders = await RemainderNotes.findAll({
        where: { noteId },
        include: [
          {
            model: Note,
            as: "note",
            where: { isDeleted: false },
          },
        ],
      });

      return reminders;
    } catch (error) {
      logger.error("Failed to fetch reminders by note ID", {
        noteId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Update a reminder
   * @param {string} remainderId - Remainder ID (noteId)
   * @param {string} userId - User ID
   * @param {object} updateData - Update data
   * @returns {object} Updated reminder
   */
  static async updateReminder(remainderId, userId, updateData) {
    try {
      const { title, date, time, repeat } = updateData;

      const remainderNote = await RemainderNotes.findOne({
        where: { noteId: remainderId, userId },
      });

      if (!remainderNote) {
        return null;
      }

      const reminderDate = date ? new Date(date) : null;

      remainderNote.reminderTitle = title || remainderNote.reminderTitle;
      remainderNote.nextReminderDate = reminderDate
        ? reminderDate.toISOString()
        : remainderNote.nextReminderDate;
      remainderNote.remainderTime = time || remainderNote.remainderTime;
      remainderNote.repeatReminder = repeat || remainderNote.repeatReminder;

      await remainderNote.save();

      logger.info("Reminder updated", { remainderId, userId });

      return remainderNote;
    } catch (error) {
      logger.error("Failed to update reminder", {
        remainderId,
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a label category
   * @param {string} userId - User ID
   * @param {object} categoryData - Category data (categoryName, colorCode)
   * @returns {object} Created category
   */
  static async createLabelCategory(userId, categoryData) {
    try {
      const { categoryName, colorCode } = categoryData;

      const newLabelCategory = await LabelCategories.create({
        categoryName,
        colorCode,
        userId,
      });

      logger.info("Label category created", {
        userId,
        categoryId: newLabelCategory.id,
      });

      return newLabelCategory;
    } catch (error) {
      logger.error("Failed to create label category", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all label categories for a user
   * @param {string} userId - User ID
   * @returns {array} Array of label categories
   */
  static async getLabelCategories(userId) {
    try {
      const labelCategories = await LabelCategories.findAll({
        where: { userId },
      });

      return labelCategories;
    } catch (error) {
      logger.error("Failed to fetch label categories", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get label category by ID
   * @param {string} categoryId - Category ID
   * @returns {object} Label category
   */
  static async getLabelCategoryById(categoryId) {
    try {
      const label = await LabelCategories.findByPk(categoryId);
      return label;
    } catch (error) {
      logger.error("Failed to fetch label category", {
        categoryId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get label categories by category name with notes
   * @param {string} userId - User ID
   * @param {string} categoryName - Category name
   * @returns {array} Array of label categories with notes
   */
  static async getLabelCategoriesByName(userId, categoryName) {
    try {
      const labelCategories = await LabelCategories.findAll({
        where: { categoryName, userId },
        include: [
          {
            model: Note,
            as: "note",
            where: { isDeleted: false },
          },
        ],
      });

      return labelCategories;
    } catch (error) {
      logger.error("Failed to fetch label categories by name", {
        userId,
        categoryName,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Update a label category
   * @param {string} categoryId - Category ID
   * @param {object} updateData - Update data
   * @returns {object} Updated category
   */
  static async updateLabelCategory(categoryId, updateData) {
    try {
      const label = await LabelCategories.findByPk(categoryId);

      if (!label) {
        return null;
      }

      await label.update(updateData);
      await label.save();

      logger.info("Label category updated", { categoryId });

      return label;
    } catch (error) {
      logger.error("Failed to update label category", {
        categoryId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete a label category
   * @param {string} categoryId - Category ID
   */
  static async deleteLabelCategory(categoryId) {
    try {
      const label = await LabelCategories.findByPk(categoryId);

      if (label) {
        await label.destroy();
        logger.info("Label category deleted", { categoryId });
      }
    } catch (error) {
      logger.error("Failed to delete label category", {
        categoryId,
        reason: error.message,
      });
      throw error;
    }
  }
}

export default NotesService;
