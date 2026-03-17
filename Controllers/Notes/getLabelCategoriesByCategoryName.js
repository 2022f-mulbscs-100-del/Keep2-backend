import redisClient from "../../config/redisClient.js";
import LabelCategories from "../../Modals/label_categories.modal.js";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getLabelCategoriesByCategoryName = async (req, res, next) => {
  const { id: userId } = req.user;
  const { title } = req.params;
  logger.info("getLabelCategories called with userId: ", { userId, title });

  const cachedKey = `LabelCategory${title}:${userId}`;

  const cachedData = await redisClient.hVals(cachedKey);

  if (cachedData.length > 0) {
    logger.info("Label Categories fetched from cache", {
      userId,
      title,
      count: cachedData.length,
    });
    return res.json(cachedData.map((item) => JSON.parse(item)));
  }

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

    const pipeline = redisClient.multi();
    pipeline.del(cachedKey);
    labelCategories.forEach((labelCategory) => {
      pipeline.hSet(cachedKey, labelCategory.id, JSON.stringify(labelCategory));
    });
    pipeline.expire(cachedKey, 3600);
    await pipeline.exec();

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
