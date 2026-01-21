import LabelCategories from "../../Modals/label_categories.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const updateLableCategories = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("updateLableCategories called with userId: ", { userId });
  try {
    const { id, categoryName, colorCode } = req.body;
    logger.info("createLabelCategories called with: ", {
      userId,
      categoryName,
    });
    const label = await LabelCategories.findByPk(id);
    if (!label) {
      return next(ErrorHandler(404, "Label Category not found"));
    }
    await label.update({
      categoryName,
      colorCode,
    });
    label.save();
    logger.info("Label Category added successfully for userId: ", userId);
    res.json(label);
  } catch (error) {
    next(error);
    logger.error("createLabelCategories error: ", { error: error.message });
  }
};
