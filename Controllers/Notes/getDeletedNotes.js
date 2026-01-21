import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getDeletedNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("Fetching deleted notes", { userId });
  try {
    const deletedNotes = await Notes.findAll({
      where: { isDeleted: true, userId },
      order: [["updatedAt", "DESC"]],
    });
    logger.info("Deleted notes retrieved successfully", {
      userId,
      count: deletedNotes.length,
    });
    res.json(deletedNotes);
  } catch (error) {
    logger.error("Error fetching deleted notes", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
