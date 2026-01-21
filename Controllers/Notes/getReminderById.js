import Notes from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getRemainderNoteById = async (req, res, next) => {
  const { id: userId } = req.user;
  const { noteId } = req.params;
  logger.info("getRemainderNoteById called", { userId, noteId });
  try {
    const remainderNotes = await RemainderNotes.findAll({
      where: { noteId },
      include: [
        {
          model: Notes,
          as: "note",
          where: { isDeleted: false },
        },
      ],
    });
    logger.info("Remainder Notes fetched successfully", {
      userId,
      noteId,
      count: remainderNotes.length,
    });
    res.json(remainderNotes);
  } catch (error) {
    logger.error("Error fetching remainder notes by ID", {
      userId,
      noteId,
      error: error.message,
    });
    next(error);
  }
};
