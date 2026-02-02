import { NotesService } from "../../Services/Notes/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Note By ID Controller
 * Retrieves a specific note with collaborators
 */
export const getNotesById = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info("Get note by ID request", { noteId: id });

    // Fetch note with collaborators using service
    const note = await NotesService.getNoteById(id);

    if (!note) {
      logger.warn("Note not found", { noteId: id });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.NOTE_NOT_FOUND)
      );
    }

    logger.info("Note retrieved successfully", { noteId: id });

    res.status(HTTP_STATUS.OK).json(note);
  } catch (error) {
    logger.error("Get note by ID error", {
      noteId: req.params?.id,
      message: error.message,
    });
    next(error);
  }
};
