import redisClient from "../../config/redisClient.js";
import Collaborators from "../../Modals/collaborators.modal.js";
import Notes from "../../Modals/notes.modal.js";

export const deleteCollaborator = async (req, res, next) => {
  const { id } = req.user;
  const { noteId, collaborator } = req.body;
  try {
    const deleted = await Collaborators.destroy({
      where: { collaborator, noteId },
    });

    const updatedNote = await Notes.findByPk(noteId);

    const NoteCachedKey = `notes:${id}`;
    const ArchiveCachedKey = `archivedNotes:${id}`;
    const DeletedCachedKey = `deletedNotes:${id}`;
    const ReminderCachedKey = `remainderNotes:${id}`;
    const cachedKey = `LabelCategory${updatedNote.category}:${id}`;

    if (deleted) {
      await redisClient.hDel(`notes:${req.user.id}`, noteId);
      const pipeline = redisClient.multi();
      pipeline.hDel(NoteCachedKey, noteId);
      pipeline.hDel(ArchiveCachedKey, noteId);
      pipeline.hDel(DeletedCachedKey, noteId);
      pipeline.hDel(ReminderCachedKey, noteId);
      pipeline.hDel(cachedKey, noteId);

      pipeline.hSet(NoteCachedKey, noteId, JSON.stringify(updatedNote));
      pipeline.expire(NoteCachedKey, 3600);

      if (updatedNote.isDeleted) {
        pipeline.hSet(DeletedCachedKey, noteId, JSON.stringify(updatedNote));
        pipeline.expire(DeletedCachedKey, 3600);
      } else if (updatedNote.isArchived) {
        pipeline.hSet(ArchiveCachedKey, noteId, JSON.stringify(updatedNote));
        pipeline.expire(ArchiveCachedKey, 3600);
      } else if (updatedNote.hasReminder) {
        pipeline.hSet(ReminderCachedKey, noteId, JSON.stringify(updatedNote));
        pipeline.expire(ReminderCachedKey, 3600);
      } else if (updatedNote.category) {
        pipeline.hSet(cachedKey, noteId, JSON.stringify(updatedNote));
        pipeline.expire(cachedKey, 3600);
      }

      res.status(200).json({
        message: "Collaborator deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "Collaborator not found",
      });
    }
  } catch (error) {
    next(error);
  }
};
