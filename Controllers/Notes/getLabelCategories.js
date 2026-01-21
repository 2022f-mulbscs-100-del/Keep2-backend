import LabelCategories from "../../Modals/label_categories.modal.js";
import { logger } from "../../utils/Logger.js";

export const getLabelCategories = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("getLabelCategories called with userId: ", { userId });

  try {
    const labelCategories = await LabelCategories.findAll({
      where: { userId },
    });
    logger.info("Label Categories fetched successfully for userId: ", userId);
    res.json(labelCategories);
  } catch (error) {
    logger.error("Error fetching label categories", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
