import LabelCategories from "../../Modals/label_categories.modal.js";
import { logger } from "../../utils/Logger.js";

export const createLabelCategories = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("createLabelCategories called with userId: ", { userId });
  try {
    const { categoryName, colorCode } = req.body;
    logger.info("createLabelCategories called with: ", {
      userId,
      categoryName,
    });
    const newLabelCategory = await LabelCategories.create({
      categoryName,
      colorCode,
      userId,
    });
    logger.info("Label Category added successfully for userId: ", userId);
    res.json(newLabelCategory);
  } catch (error) {
    next(error);
    logger.error("createLabelCategories error: ", { error: error.message });
  }
};
