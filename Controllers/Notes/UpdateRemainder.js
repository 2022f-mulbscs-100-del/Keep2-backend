import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Update Remainder Controller
 * Updates an existing reminder
 */
export const updateRemainder = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { remainderId } = req.params;
    const { title, date, time, repeat } = req.body;

    logger.info("Update remainder request", { userId, remainderId });

    // Update remainder using service
    const updatedRemainder = await NotesService.updateReminder(
      remainderId,
      userId,
      {
        title,
        date,
        time,
        repeat,
      }
    );

    if (!updatedRemainder) {
      logger.warn("Update failed: Remainder not found", {
        remainderId,
        userId,
      });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.REMINDER_NOT_FOUND)
      );
    }

    logger.info("Remainder updated successfully", { userId, remainderId });

    res.status(HTTP_STATUS.OK).json(updatedRemainder);
  } catch (error) {
    logger.error("Update remainder error", {
      userId: req.user?.id,
      remainderId: req.params?.remainderId,
      message: error.message,
    });
    next(error);
  }
};
