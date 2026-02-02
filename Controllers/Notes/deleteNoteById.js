import { NotesService } from "../../Services/Notes/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Delete Note By ID Controller
 * Permanently deletes a note
 */
export const deleteNotesById = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info("Delete note request", { noteId: id });

    // Check if note exists
    const note = await NotesService.getNoteById(id);
    if (!note) {
      logger.warn("Delete failed: Note not found", { noteId: id });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.NOTE_NOT_FOUND)
      );
    }

    // Delete note using service
    await NotesService.deleteNote(id);

    logger.info("Note deleted successfully", { noteId: id });

    res.status(HTTP_STATUS.OK).json({
      message: NOTE_MESSAGES.NOTE_DELETED_SUCCESS,
    });
  } catch (error) {
    logger.error("Delete note error", {
      noteId: req.params?.id,
      message: error.message,
    });
    next(error);
  }
};
