import redisClient from "../../config/redisClient.js";
import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const updateNotes = async (req, res, next) => {
  const { id: noteId } = req.params;
  const { id: userId } = req.user;
  const {
    title,
    description,
    pinned,
    isDeleted,
    isArchived,
    imageUrl,
    bgColor,
  } = req.body;

  const NoteCachedKey = `notes:${userId}`;
  const ArchiveCachedKey = `archivedNotes:${userId}`;
  const DeletedCachedKey = `deletedNotes:${userId}`;
  const ReminderCachedKey = `remainderNotes:${userId}`;
  const cachedKey = `LabelCategory${title}:${userId}`;

  logger.info("Update note called in NotesController", {
    noteId: noteId,
    updateData: req.body,
  });

  try {
    const note = await Notes.findByPk(noteId);
    if (!note) {
      logger.warn("Note not found for update", { noteId: noteId });
      return next(ErrorHandler(404, "Note not found"));
    }
    const existingImages = note.dataValues.image || [];
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
      { where: { id: noteId } }
    );

    if (!updatedNote) {
      logger.error("Failed to update note", { noteId: noteId });
      return res.status(404).json({ message: "Note not found" });
    }
    const newNote = await Notes.findByPk(noteId);

    //REDIS CACHE UPDATE
    const pipeline = redisClient.multi();
    pipeline.hDel(NoteCachedKey, noteId);
    pipeline.hDel(ArchiveCachedKey, noteId);
    pipeline.hDel(DeletedCachedKey, noteId);
    pipeline.hDel(ReminderCachedKey, noteId);
    pipeline.hDel(cachedKey, noteId);

    pipeline.hSet(NoteCachedKey, noteId, JSON.stringify(newNote));
    pipeline.expire(NoteCachedKey, 3600);

    if (newNote.isDeleted) {
      pipeline.hSet(DeletedCachedKey, noteId, JSON.stringify(newNote));
      pipeline.expire(DeletedCachedKey, 3600);
    } else if (newNote.isArchived) {
      pipeline.hSet(ArchiveCachedKey, noteId, JSON.stringify(newNote));
      pipeline.expire(ArchiveCachedKey, 3600);
    } else if (newNote.hasReminder) {
      pipeline.hSet(ReminderCachedKey, noteId, JSON.stringify(newNote));
      pipeline.expire(ReminderCachedKey, 3600);
    } else if (newNote.category) {
      pipeline.hSet(cachedKey, noteId, JSON.stringify(newNote));
      pipeline.expire(cachedKey, 3600);
    }

    await pipeline.exec();

    logger.info("Note updated successfully", { noteId: noteId });
    res.json(newNote);
  } catch (error) {
    logger.error("Error updating note", {
      noteId: noteId,
      error: error.message,
    });
    next(error);
  }
};
