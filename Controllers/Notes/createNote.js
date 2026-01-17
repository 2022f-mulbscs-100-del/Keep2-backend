import Notes from "../../Modals/notes.js";
import { logger } from "../../utils/Logger.js";

export const createNote = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("createNote called with userId: ", { userId });
  try {
    const { title, description, pinned } = req.body;
    logger.info("addNotes called with: ", { userId, title });
    const newNote = await Notes.create({
      title,
      description,
      pinned,
      isDeleted: false,
      isArchived: false,
      userId,
    });
    logger.info("Note added successfully for userId: ", userId);
    res.json(newNote);
  } catch (error) {
    next(error);
    logger.error("addNotes error: ", { error: error.message });
  }
};
