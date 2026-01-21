import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";
import { createNoteValidation } from "../../validation/NotesValidation.js";

export const createNote = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("createNote called with userId: ", { userId });
  const { title, description, pinned, catgeory, list } =
    createNoteValidation.parse(req.body);
  try {
    logger.info("addNotes called with: ", { userId, title });
    const newNote = await Notes.create({
      title,
      description,
      pinned,
      isDeleted: false,
      isArchived: false,
      userId,
      category: catgeory,
      list: list || [],
    });
    logger.info("Note added successfully for userId: ", userId);
    res.json(newNote);
  } catch (error) {
    next(error);
    logger.error("addNotes error: ", { error: error.message });
  }
};
