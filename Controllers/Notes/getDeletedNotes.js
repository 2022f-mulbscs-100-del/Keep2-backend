import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Deleted Notes Controller
 * Retrieves all soft-deleted notes for the authenticated user
 */
export const getDeletedNotes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Get deleted notes request", { userId });

    // Fetch deleted notes using service
    const deletedNotes = await NotesService.getDeletedNotes(userId);

    logger.info("Deleted notes retrieved successfully", {
      userId,
      count: deletedNotes.length,
    });

    res.status(HTTP_STATUS.OK).json(deletedNotes);
  } catch (error) {
    logger.error("Get deleted notes error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
