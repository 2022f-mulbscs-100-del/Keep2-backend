import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const deleteNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("Deleting all notes for user", { userId });
  try {
    await Notes.destroy({ where: { isDeleted: true, userId } });
    logger.info("Notes deleted successfully", { userId });
    res.json("Note Deleted");
  } catch (error) {
    logger.error("Error deleting notes", { userId, error: error.message });
    next(error);
  }
};
