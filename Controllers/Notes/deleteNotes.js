import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Delete Notes Controller
 * Permanently deletes all soft-deleted notes for a user
 */
export const deleteNotes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Delete all soft-deleted notes request", { userId });

    // Delete all soft-deleted notes using service
    await NotesService.permanentlyDeleteAllNotes(userId);

    logger.info("All soft-deleted notes permanently deleted", { userId });

    res.status(HTTP_STATUS.OK).json({
      message: NOTE_MESSAGES.NOTES_DELETED_SUCCESS,
    });
  } catch (error) {
    logger.error("Delete notes error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
