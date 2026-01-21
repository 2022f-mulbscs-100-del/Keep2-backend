import LabelCategories from "../../Modals/label_categories.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const deleteLabelCategory = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("deleteLabelCategory called with userId: ", { userId });
  try {
    const { id } = req.params;
    logger.info("deleteLabelCategory called with: ", {
      userId,
      id,
    });
    const label = await LabelCategories.findByPk(id);
    if (!label) {
      return next(ErrorHandler(404, "Label Category not found"));
    }
    await label.destroy();
    logger.info("Label Category deleted successfully for userId: ", userId);
    res.json({ message: "Label Category deleted successfully" });
  } catch (error) {
    next(error);
    logger.error("deleteLabelCategory error: ", { error: error.message });
  }
};
