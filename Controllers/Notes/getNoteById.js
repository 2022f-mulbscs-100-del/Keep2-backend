import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const getNotesById = async (req, res, next) => {
  const { id } = req.params;
  logger.info("Fetching note by ID", { noteId: id });

  try {
    const note = await Notes.findByPk(id);
    if (!note) {
      logger.warn("Note not found", { noteId: id });
      return next(ErrorHandler(404, "Note not found"));
    } else {
      logger.info("Note retrieved successfully", { noteId: id });
    }
    res.json(note);
  } catch (error) {
    logger.error("Error fetching note", { noteId: id, error: error.message });
    next(error);
  }
};
