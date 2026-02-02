import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { createNoteValidation } from "../../validation/NotesValidation.js";
import { HTTP_STATUS } from "../../Constants/messages.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";

/**
 * Create Note Controller
 * Creates a new note for the authenticated user
 */
export const createNote = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    // Validate request body
    const { title, description, pinned, catgeory, list } =
      createNoteValidation.parse(req.body);

    logger.info("Create note request", { userId, title });

    // Create note using service
    const newNote = await NotesService.createNote(userId, {
      title,
      description,
      pinned,
      category: catgeory,
      list: list || [],
    });

    logger.info("Note created successfully", { userId, noteId: newNote.id });

    res.status(HTTP_STATUS.CREATED).json(newNote);
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Create note validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Create note error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
