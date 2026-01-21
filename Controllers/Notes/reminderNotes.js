import Notes from "../../Modals/notes.modal.js";
import RemainderNotes from "../../Modals/RemainderNotes.modal.js";
import { logger } from "../../utils/Logger.js";

export const remindersNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  const { noteId, title, date, time, repeat } = req.body;
  logger.info("remindersNotes called with userId: ", {
    userId,
    noteId,
    title,
    repeat,
  });
  try {
    const note = await Notes.findByPk(noteId);
    if (!note) {
      logger.warn("Note not found for reminder creation", { noteId, userId });
      return res.status(404).json({ message: "Note not found" });
    }

    const reminderDate = new Date(date);
    logger.info("Reminder date parsed", {
      reminderDate: reminderDate.toISOString(),
    });

    const reminderNote = await RemainderNotes.create({
      noteId,
      userId,
      reminderTitle: title,
      remainderTime: time,
      repeatReminder: repeat,
      nextReminderDate: reminderDate.toISOString(),
      reminderStatus: false,
    });
    note.hasReminder = true;
    await note.save();
    //  const reminders = await RemainderNotes.findAll({ where: { userId } ,include:[{
    logger.info("Reminder Note created successfully for userId: ", {
      userId,
      reminderId: reminderNote.id,
    });
    res.json(reminderNote);
    // res.json(reminders);
  } catch (error) {
    logger.error("remindersNotes error: ", {
      userId,
      noteId,
      error: error.message,
    });
    next(error);
  }
};

// const checkNextReminderDate = (date, time, repeat) => {

// const reminderDate = new Date(`${date}T${time}:00`);
// if (!repeat) {
//   return null; // No next reminder date for one-time reminders
// }

// const currentDate = new Date(); //jan 17

// let nextDate = new Date(reminderDate); // jan 20

// while (nextDate <= currentDate) {
//   switch (repeat) {
//     case "daily":
//       nextDate.setDate(nextDate.getDate() + 1);
//       break;
//     case "weekly":
//       nextDate.setDate(nextDate.getDate() + 7);
//       break;
//     case "monthly":
//       nextDate.setMonth(nextDate.getMonth() + 1);
//       break;
//     case "yearly":
//       nextDate.setFullYear(nextDate.getFullYear() + 1);
//       break;
//     default:
//       return null;
//   }

//   return nextDate;
// }

// }

//have 3 main param date,time,repeat what is the date form now on which
// remainder will be set ,time at what time and repeat how often daily,weekly etc
// repeat can have values like daily,weekly,monthly,yearly or null

// one time repeat then we will set date and time as well
// if repeat is null then its one time reminder
// if repeat is daily then we will set time only and date will be ignored
// if repeat is weekly then we will set date and time
// if repeat is monthly then we will set date and time
// if repeat is yearly then we will set date and time

// okay user set the reminder for a note on 17 jan on 10 have to repeat on every week
// then we will set date as 17 jan and time as 10 and repeat as weekly
// so every week on wednesday at 10 the reminder will be triggered
// so we increment the date by 7 days and set the reminder again
//
