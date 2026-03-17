import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";

export const deleteNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  const NoteCachedKey = `notes:${userId}`;
  const DeletedCachedKey = `deletedNotes:${userId}`;
  logger.info("Deleting all notes for user", { userId });
  try {
    await Notes.destroy({ where: { isDeleted: true, userId } });
    logger.info("Notes deleted successfully", { userId });

    const cachedData = await redisClient.hVals(NoteCachedKey);
    if (cachedData && cachedData.length > 0) {
      logger.info("Deleting notes from cache for user", {
        userId,
        noteCount: cachedData.length,
      });
      const notes = cachedData.map((note) => {
        return JSON.parse(note);
      });
      const filterNotes = notes.filter((note) => note.isDeleted !== true);
      const pipeline = redisClient.multi();
      pipeline.del(NoteCachedKey);
      if (filterNotes.length > 0) {
        const hashData = {};
        filterNotes.forEach((note) => {
          hashData[note.id] = JSON.stringify(note);
        });
        pipeline.hSet(NoteCachedKey, hashData);
        pipeline.expire(NoteCachedKey, 3600);
      }
      await pipeline.exec();
    }
    await redisClient.del(DeletedCachedKey);
    logger.info("Notes-related caches cleared from Redis", { userId });
    res.json("Note Deleted");
  } catch (error) {
    logger.error("Error deleting notes", { userId, error: error.message });
    next(error);
  }
};
