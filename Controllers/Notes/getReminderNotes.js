import Notes from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getRemainderNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("getRemainderNotes called with userId: ", { userId });
  try {
    const remainderNotes = await RemainderNotes.findAll({
      where: { userId },
      include: [
        {
          model: Notes,
          as: "note",
          where: { isDeleted: false },
        },
      ],
    });
    logger.info("Remainder Notes fetched successfully for userId: ", {
      userId,
      count: remainderNotes.length,
    });
    res.json(remainderNotes);
  } catch (error) {
    logger.error("Error fetching remainder notes", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
