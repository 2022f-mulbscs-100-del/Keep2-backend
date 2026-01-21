import LabelCategories from "../../Modals/label_categories.modal.js";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getLabelCategoriesByCategoryName = async (req, res, next) => {
  const { id: userId } = req.user;
  const { title } = req.params;
  logger.info("getLabelCategories called with userId: ", { userId, title });

  try {
    const labelCategories = await LabelCategories.findAll({
      where: { categoryName: title, userId },
      include: [
        {
          model: Notes,
          as: "note",
          where: { isDeleted: false },
        },
      ],
    });
    logger.info("Label Categories retrieved", {
      userId,
      title,
      count: labelCategories.length,
    });
    res.json(labelCategories);
  } catch (error) {
    logger.error("Error fetching label categories", {
      userId,
      title,
      error: error.message,
    });
    next(error);
  }
};
