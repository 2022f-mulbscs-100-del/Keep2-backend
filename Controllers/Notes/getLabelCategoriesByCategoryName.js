import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Label Categories By Category Name Controller
 * Retrieves label categories and associated notes by category name
 */
export const getLabelCategoriesByCategoryName = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { title } = req.params;

    logger.info("Get label categories by name request", { userId, title });

    // Fetch label categories by name using service
    const labelCategories = await NotesService.getLabelCategoriesByName(
      userId,
      title
    );

    logger.info("Label categories retrieved", {
      userId,
      title,
      count: labelCategories.length,
    });

    res.status(HTTP_STATUS.OK).json(labelCategories);
  } catch (error) {
    logger.error("Get label categories by name error", {
      userId: req.user?.id,
      title: req.params?.title,
      message: error.message,
    });
    next(error);
  }
};
