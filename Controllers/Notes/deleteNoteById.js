import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const deleteNotesById = async (req, res, next) => {
  const { id } = req.params;
  logger.info("Deleting note by ID", { noteId: id });

  try {
    const note = await Notes.findByPk(id);
    if (!note) {
      logger.warn("Note not found", { noteId: id });
      return next(ErrorHandler(404, "Note not found"));
    }
    await Notes.destroy({ where: { id } });
    logger.info("Note deleted successfully", { noteId: id });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    logger.error("Error deleting note", { noteId: id, error: error.message });
    next(error);
  }
};
