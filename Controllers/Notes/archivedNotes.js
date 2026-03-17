import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getArchivedNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("Fetching archived notes", { userId });
  const cachedKey = `archivedNotes:${userId}`;

  const cachedData = await redisClient.hVals(cachedKey);
  if (cachedData.length > 0) {
    logger.info("Archived notes fetched from cache", {
      userId,
      count: cachedData.length,
    });
    return res.json(cachedData.map((note) => JSON.parse(note)));
  }
  try {
    const archivedNotes = await Notes.findAll({
      where: { isArchived: true, isDeleted: false, userId },
    });
    logger.info("Archived notes retrieved successfully", {
      userId,
      count: archivedNotes.length,
    });

    const pipeline = redisClient.multi();
    pipeline.del(cachedKey);
    archivedNotes.forEach((note) => {
      pipeline.hSet(cachedKey, note.id, JSON.stringify(note));
    });
    pipeline.expire(cachedKey, 3600);
    await pipeline.exec();

    res.json(archivedNotes);
  } catch (error) {
    logger.error("Error fetching archived notes", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
