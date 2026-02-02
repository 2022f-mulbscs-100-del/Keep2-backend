import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Archived Notes Controller
 * Retrieves all archived notes for the authenticated user
 */
export const getArchivedNotes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Get archived notes request", { userId });

    // Fetch archived notes using service
    const archivedNotes = await NotesService.getArchivedNotes(userId);

    logger.info("Archived notes retrieved successfully", {
      userId,
      count: archivedNotes.length,
    });

    res.status(HTTP_STATUS.OK).json(archivedNotes);
  } catch (error) {
    logger.error("Get archived notes error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
