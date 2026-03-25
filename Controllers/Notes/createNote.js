import redisClient from "../../config/redisClient.js";
import LabelCategories from "../../Modals/label_categories.modal.js";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";
import { createNoteValidation } from "../../validation/NotesValidation.js";

export const createNote = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("createNote called with userId: ", { userId });
  const {
    id: clientId,
    title,
    description,
    pinned,
    category,
    catgeory,
    list,
  } = createNoteValidation.parse(req.body);
  try {
    logger.info("addNotes called with: ", { userId, title, clientId });

    const normalizedCategory = (category ?? catgeory)?.trim();

    let isCategoryExist = null;
    if (normalizedCategory) {
      isCategoryExist = await LabelCategories.findOne({
        where: { userId, categoryName: normalizedCategory },
      });
    }

    if (normalizedCategory && !isCategoryExist) {
      logger.warn("Category does not exist for userId: ", {
        userId,
        category: normalizedCategory,
      });
      return res.status(400).json({ message: "Category does not exist" });
    }

    const newNote = await Notes.create({
      id: clientId,
      title,
      description,
      pinned,
      isDeleted: false,
      isArchived: false,
      userId,
      category: normalizedCategory,
      list: list || [],
    });
    logger.info("Note added successfully for userId: ", userId);

    await redisClient.hSet(
      `notes:${userId}`,
      newNote.id,
      JSON.stringify(newNote)
    );
    await redisClient.expire(`notes:${userId}`, 3600);
    logger.info("Note cached in Redis for userId: ", userId);
    res.json(newNote);
  } catch (error) {
    next(error);
    logger.error("addNotes error: ", { error: error.message });
  }
};
