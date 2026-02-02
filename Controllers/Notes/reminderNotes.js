import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Create Reminder Controller
 * Creates a reminder for a specific note
 */
export const remindersNotes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { noteId, title, date, time, repeat } = req.body;

    logger.info("Create reminder request", { userId, noteId, title, repeat });

    // Check if note exists
    const note = await NotesService.getNoteById(noteId);
    if (!note) {
      logger.warn("Reminder creation failed: Note not found", {
        noteId,
        userId,
      });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.NOTE_NOT_FOUND)
      );
    }

    // Create reminder using service
    const reminderNote = await NotesService.createReminder(userId, noteId, {
      title,
      date,
      time,
      repeat,
    });

    logger.info("Reminder created successfully", {
      userId,
      reminderId: reminderNote.id,
    });

    res.status(HTTP_STATUS.CREATED).json(reminderNote);
  } catch (error) {
    logger.error("Create reminder error", {
      userId: req.user?.id,
      noteId: req.body?.noteId,
      message: error.message,
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
