import { NotesService } from "../../Services/Notes/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Update Label Category Controller
 * Updates an existing label category
 */
export const updateLableCategories = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { id, categoryName, colorCode } = req.body;

    logger.info("Update label category request", {
      userId,
      categoryId: id,
      categoryName,
    });

    // Check if label exists
    const label = await NotesService.getLabelCategoryById(id);
    if (!label) {
      logger.warn("Update failed: Label category not found", {
        categoryId: id,
      });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.LABEL_NOT_FOUND)
      );
    }

    // Update label category using service
    const updatedLabel = await NotesService.updateLabelCategory(id, {
      categoryName,
      colorCode,
    });

    logger.info("Label category updated successfully", {
      userId,
      categoryId: id,
    });

    res.status(HTTP_STATUS.OK).json(updatedLabel);
  } catch (error) {
    logger.error("Update label category error", {
      userId: req.user?.id,
      categoryId: req.body?.id,
      message: error.message,
    });
    next(error);
  }
};
