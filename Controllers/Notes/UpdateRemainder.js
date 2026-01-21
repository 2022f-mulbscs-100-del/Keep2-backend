import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const updateRemainder = async (req, res, next) => {
  const { id: userId } = req.user;
  const { remainderId } = req.params;
  const { title, date, time, repeat } = req.body;
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
      where: { noteId: remainderId, userId },
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
    remainderNote.repeatReminder = repeat || remainderNote.repeatReminder;

    await remainderNote.save();
    logger.info("Remainder Note updated successfully for userId: ", userId);
    res.json(remainderNote);
  } catch (error) {
    logger.error("updateRemainder error: ", { error: error.message });
    next(error);
  }
};
