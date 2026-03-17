import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getDeletedNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("Fetching deleted notes", { userId });

  const cachedKey = `deletedNotes:${String(userId)}`;

  const cachedData = await redisClient.hVals(cachedKey);
  if (cachedData.length > 0) {
    logger.info("Deleted notes fetched from cache", {
      userId,
      count: cachedData.length,
    });
    return res.json(cachedData.map((note) => JSON.parse(note)));
  }

  try {
    const deletedNotes = await Notes.findAll({
      where: { isDeleted: true, userId },
      order: [["updatedAt", "DESC"]],
    });
    logger.info("Deleted notes retrieved successfully", {
      userId,
      count: deletedNotes.length,
    });

    const pipeline = redisClient.multi();
    pipeline.del(cachedKey);
    deletedNotes.forEach((note) => {
      pipeline.hSet(cachedKey, note.id, JSON.stringify(note));
    });
    pipeline.expire(cachedKey, 3600);
    await pipeline.exec();

    res.json(deletedNotes);
  } catch (error) {
    logger.error("Error fetching deleted notes", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
