import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getRemainderNoteById = async (req, res, next) => {
  const { id: userId } = req.user;
  const { noteId } = req.params;
  logger.info("getRemainderNoteById called", { userId, noteId });

  const cachedKey = `remainderNotes:${userId}`;
  const cachedData = await redisClient.hGet(cachedKey, noteId);
  if (cachedData) {
    logger.info("Remainder Note fetched from cache", { userId, noteId });
    return res.json(JSON.parse(cachedData));
  }
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

    await redisClient.hSet(cachedKey, noteId, JSON.stringify(remainderNotes));
    await redisClient.expire(cachedKey, 3600);
    logger.info("Remainder Note cached in Redis", { userId, noteId });
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
