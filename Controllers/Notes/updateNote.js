import Notes from "../../Modals/notes.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const updateNotes = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, pinned, isDeleted, isArchived, imageUrl } =
    req.body;

  logger.info("Update note called in NotesController", {
    noteId: id,
    updateData: req.body,
  });

  try {
    const note = await Notes.findByPk(id);
    if (!note) {
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
      },
      { where: { id } }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    const newNote = await Notes.findByPk(id);
    res.json(newNote);
  } catch (error) {
    next(error);
  }
};
