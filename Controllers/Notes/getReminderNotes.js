import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Reminder Notes Controller
 * Retrieves all reminder notes for the authenticated user
 */
export const getRemainderNotes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Get reminder notes request", { userId });

    // Fetch reminder notes using service
    const remainderNotes = await NotesService.getReminderNotes(userId);

    logger.info("Reminder notes fetched successfully", {
      userId,
      count: remainderNotes.length,
    });

    res.status(HTTP_STATUS.OK).json(remainderNotes);
  } catch (error) {
    logger.error("Get reminder notes error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
