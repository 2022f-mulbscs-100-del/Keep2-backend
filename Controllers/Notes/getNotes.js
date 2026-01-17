import Notes from "../../Modals/notes.js";
import { logger } from "../../utils/Logger.js";

export const getNotes = async (req, res) => {
  const { id: userId } = req.user;
  console.log(req.user);
  logger.info("Fetching notes for userId: ", { userId });
  const allNotes = await Notes.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
  logger.info("Notes fetched successfully for userId: ", {
    userId,
    noteCount: allNotes.length,
  });
  res.json(allNotes);
};
