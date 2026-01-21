import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getArchivedNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("Fetching archived notes", { userId });
  try {
    const archivedNotes = await Notes.findAll({
      where: { isArchived: true, isDeleted: false, userId },
    });
    logger.info("Archived notes retrieved successfully", {
      userId,
      count: archivedNotes.length,
    });
    res.json(archivedNotes);
  } catch (error) {
    logger.error("Error fetching archived notes", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
