import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Create Label Category Controller
 * Creates a new label category for organizing notes
 */
export const createLabelCategories = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { categoryName, colorCode } = req.body;

    logger.info("Create label category request", { userId, categoryName });

    // Create label category using service
    const newLabelCategory = await NotesService.createLabelCategory(userId, {
      categoryName,
      colorCode,
    });

    logger.info("Label category created successfully", {
      userId,
      categoryId: newLabelCategory.id,
    });

    res.status(HTTP_STATUS.CREATED).json(newLabelCategory);
  } catch (error) {
    logger.error("Create label category error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
