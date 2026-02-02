import { NotesService } from "../../Services/Notes/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Delete Label Category Controller
 * Deletes a label category
 */
export const deleteLabelCategory = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    logger.info("Delete label category request", { userId, categoryId: id });

    // Check if label exists
    const label = await NotesService.getLabelCategoryById(id);
    if (!label) {
      logger.warn("Delete failed: Label category not found", {
        categoryId: id,
      });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.LABEL_NOT_FOUND)
      );
    }

    // Delete label category using service
    await NotesService.deleteLabelCategory(id);

    logger.info("Label category deleted successfully", {
      userId,
      categoryId: id,
    });

    res.status(HTTP_STATUS.OK).json({
      message: NOTE_MESSAGES.LABEL_DELETED_SUCCESS,
    });
  } catch (error) {
    logger.error("Delete label category error", {
      userId: req.user?.id,
      categoryId: req.params?.id,
      message: error.message,
    });
    next(error);
  }
};
