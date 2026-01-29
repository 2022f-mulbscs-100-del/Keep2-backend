import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const updateNotes = async (req, res, next) => {
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

  logger.info("Update note called in NotesController", {
    noteId: id,
    updateData: req.body,
  });

  try {
    const note = await Notes.findByPk(id);
    if (!note) {
      logger.warn("Note not found for update", { noteId: id });
      return next(ErrorHandler(404, "Note not found"));
    }
    const existingImages = note.dataValues.image || "[]";
    const newImages = Array.isArray(imageUrl) ? imageUrl : [];
    const imageUrlCombined = [...existingImages, ...newImages];
    const updatedNote = await Notes.update(
      {
        title,
        description,
        pinned,
        isDeleted,
        isArchived,
        image: imageUrlCombined,
        bgColor: bgColor || null,
      },
      { where: { id } }
    );

    if (!updatedNote) {
      logger.error("Failed to update note", { noteId: id });
      return res.status(404).json({ message: "Note not found" });
    }
    const newNote = await Notes.findByPk(id);
    logger.info("Note updated successfully", { noteId: id });
    res.json(newNote);
  } catch (error) {
    logger.error("Error updating note", { noteId: id, error: error.message });
    next(error);
  }
};
