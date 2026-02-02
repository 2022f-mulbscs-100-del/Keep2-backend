import { NotesService } from "../../Services/Notes/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { NOTE_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Update Note Controller
 * Updates an existing note
 */
export const updateNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      pinned,
      isDeleted,
      isArchived,
      imageUrl,
      bgColor,
    } = req.body;

    logger.info("Update note request", { noteId: id, updateData: req.body });

    // Check if note exists
    const note = await NotesService.getNoteById(id);
    if (!note) {
      logger.warn("Update failed: Note not found", { noteId: id });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.NOTE_NOT_FOUND)
      );
    }

    // Combine existing images with new ones
    const existingImages = note.image || [];
    const newImages = Array.isArray(imageUrl) ? imageUrl : [];
    const imageUrlCombined = [...existingImages, ...newImages];

    // Update note using service
    const updatedNote = await NotesService.updateNote(id, {
      title,
      description,
      pinned,
      isDeleted,
      isArchived,
      image: imageUrlCombined,
      bgColor: bgColor || null,
    });

    logger.info("Note updated successfully", { noteId: id });

    res.status(HTTP_STATUS.OK).json(updatedNote);
  } catch (error) {
    logger.error("Update note error", {
      noteId: req.params?.id,
      message: error.message,
    });
    next(error);
  }
};
