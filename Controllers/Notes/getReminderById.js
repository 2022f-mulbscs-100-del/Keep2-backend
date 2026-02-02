import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Reminder By Note ID Controller
 * Retrieves all reminders for a specific note
 */
export const getRemainderNoteById = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { noteId } = req.params;

    logger.info("Get reminder by note ID request", { userId, noteId });

    // Fetch reminders by note ID using service
    const remainderNotes = await NotesService.getRemindersByNoteId(noteId);

    logger.info("Reminders fetched successfully", {
      userId,
      noteId,
      count: remainderNotes.length,
    });

    res.status(HTTP_STATUS.OK).json(remainderNotes);
  } catch (error) {
    logger.error("Get reminder by note ID error", {
      userId: req.user?.id,
      noteId: req.params?.noteId,
      message: error.message,
    });
    next(error);
  }
};
