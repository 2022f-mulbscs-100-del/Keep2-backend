import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const getRemainderNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("getRemainderNotes called with userId: ", { userId });

  const cachedKey = `remainderNotes:${userId}`;
  const cachedData = await redisClient.hVals(cachedKey);
  if (cachedData && cachedData.length > 0) {
    logger.info("Remainder Notes fetched from cache for userId: ", {
      userId,
      noteCount: cachedData.length,
    });
    const remainderNotes = cachedData
      .flatMap((note) => {
        const parsed = JSON.parse(note);
        return Array.isArray(parsed) ? parsed : [parsed];
      })
      .filter((item) => item?.note);
    return res.json(remainderNotes);
  }

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

    // Cache the remainder notes in Redis
    const pipeline = redisClient.multi();
    pipeline.del(cachedKey);
    const groupedByNoteId = remainderNotes.reduce((acc, note) => {
      const key = String(note.noteId);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(note);
      return acc;
    }, {});

    Object.entries(groupedByNoteId).forEach(([noteId, notes]) => {
      pipeline.hSet(cachedKey, noteId, JSON.stringify(notes));
    });
    pipeline.expire(cachedKey, 3600);
    await pipeline.exec();

    res.json(remainderNotes);
  } catch (error) {
    logger.error("Error fetching remainder notes", {
      userId,
      error: error.message,
    });
    next(error);
  }
};
