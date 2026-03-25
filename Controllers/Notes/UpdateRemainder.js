import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const updateRemainder = async (req, res, next) => {
  const { id: userId } = req.user;
  const { remainderId } = req.params;
  const { title, date, time, repeat } = req.body;
  const ReminderCachedKey = `remainderNotes:${userId}`;

  logger.info("updateRemainder called with userId: ", { userId });
  logger.info("updateRemainder params: ", {
    remainderId,
    title,
    date,
    time,
    repeat,
  });
  try {
    const remainderNote = await RemainderNotes.findOne({
      where: { id: remainderId, userId },
    });
    if (!remainderNote) {
      const error = new Error("Remainder note not found");
      error.status = 404;
      throw error;
    }

    const reminderDate = new Date(date);
    logger.info("Reminder date being updated", {
      reminderDate: reminderDate.toISOString(),
    });

    remainderNote.reminderTitle = title || remainderNote.reminderTitle;
    remainderNote.nextReminderDate =
      reminderDate.toISOString() || remainderNote.nextReminderDate;
    remainderNote.remainderTime = time || remainderNote.remainderTime;
    remainderNote.repeatReminder =
      repeat !== undefined ? repeat : remainderNote.repeatReminder;

    await remainderNote.save();
    const noteReminders = await RemainderNotes.findAll({
      where: { userId, noteId: remainderNote.noteId },
      include: [
        {
          model: Notes,
          as: "note",
          where: { isDeleted: false },
        },
      ],
    });
    await redisClient.hSet(
      ReminderCachedKey,
      remainderNote.noteId,
      JSON.stringify(noteReminders)
    );
    await redisClient.expire(ReminderCachedKey, 3600);
    logger.info(
      "Remainder Note updated and cached in Redis for userId: ",
      userId
    );

    logger.info("Remainder Note updated successfully for userId: ", userId);
    res.json(remainderNote);
  } catch (error) {
    logger.error("updateRemainder error: ", { error: error.message });
    next(error);
  }
};
