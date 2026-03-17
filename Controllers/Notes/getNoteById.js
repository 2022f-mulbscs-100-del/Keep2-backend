import redisClient from "../../config/redisClient.js";
import Collaborators from "../../Modals/collaborators.modal.js";
import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const getNotesById = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  logger.info("Fetching note by ID", { noteId: id });

  const cachedKey = `notes:${userId}`;
  const cashedData = await redisClient.hGet(cachedKey, id);
  logger.info("Note cached in Redis", { noteId: id, userId: userId });

  if (cashedData) {
    return res.json(JSON.parse(cashedData));
  }

  try {
    const note = await Notes.findByPk(id, {
      include: [{ model: Collaborators, as: "collaborators" }],
    });
    if (!note) {
      logger.warn("Note not found", { noteId: id });
      return next(ErrorHandler(404, "Note not found"));
    } else {
      logger.info("Note retrieved successfully", { noteId: id });
    }
    await redisClient.hSet(cachedKey, id, JSON.stringify(note));
    res.json(note);
  } catch (error) {
    logger.error("Error fetching note", { noteId: id, error: error.message });
    next(error);
  }
};
