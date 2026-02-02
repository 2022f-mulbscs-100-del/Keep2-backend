import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Label Categories Controller
 * Retrieves all label categories for the authenticated user
 */
export const getLabelCategories = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Get label categories request", { userId });

    // Fetch label categories using service
    const labelCategories = await NotesService.getLabelCategories(userId);

    logger.info("Label categories fetched successfully", {
      userId,
      count: labelCategories.length,
    });

    res.status(HTTP_STATUS.OK).json(labelCategories);
  } catch (error) {
    logger.error("Get label categories error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
