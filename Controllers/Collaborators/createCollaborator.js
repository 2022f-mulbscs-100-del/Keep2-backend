import Collaborators from "../../Modals/collaborators.modal.js";
import axios from "axios";
import User from "../../Modals/UserModal.js";
import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import redisClient from "../../config/redisClient.js";

export const addCollaborator = async (req, res, next) => {
  const { id } = req.user;
  const { noteId, collaborator, role } = req.body;

  try {
    const user = await User.findOne({ where: { email: collaborator } });
    if (!user) {
      return next(ErrorHandler(404, "Collaborator user not found"));
    }
    const owner = await User.findByPk(id);
    if (!owner) {
      return next(ErrorHandler(404, "Owner user not found"));
    }
    const checkNote = await Notes.findByPk(noteId);
    if (!checkNote) {
      return next(ErrorHandler(404, "Note not found"));
    }
    const existingCollaborator = await Collaborators.findOne({
      where: { noteId, collaborator },
    });
    if (existingCollaborator) {
      return next(ErrorHandler(400, "Collaborator already added to this note"));
    }

    const newCollaborator = await Collaborators.create({
      noteId,
      userId: user.id,
      collaborator,
      role: role || "viewer",
    });

    const note = await Notes.findByPk(noteId);
    note.OwnerAttributes = {
      id: owner.id,
      email: owner.email,
      name: owner.name,
    };
    await note.save();

    const NoteCachedKey = `notes:${id}`;
    const ArchiveCachedKey = `archivedNotes:${id}`;
    const DeletedCachedKey = `deletedNotes:${id}`;
    const ReminderCachedKey = `remainderNotes:${id}`;
    const cachedKey = `LabelCategory${note.category}:${id}`;

    console.log("Sending email to collaborator:", newCollaborator);
    axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: collaborator }],
        templateId: 5,
        params: {
          noteLink: `${process.env.FRONTEND_URL}/notes/${noteId}`,
          email: collaborator,
        },
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const pipeline = redisClient.multi();
    pipeline.hDel(NoteCachedKey, noteId);
    pipeline.hDel(ArchiveCachedKey, noteId);
    pipeline.hDel(DeletedCachedKey, noteId);
    pipeline.hDel(ReminderCachedKey, noteId);
    pipeline.hDel(cachedKey, noteId);

    pipeline.hSet(NoteCachedKey, noteId, JSON.stringify(note));
    pipeline.expire(NoteCachedKey, 3600);

    if (note.isDeleted) {
      pipeline.hSet(DeletedCachedKey, noteId, JSON.stringify(note));
      pipeline.expire(DeletedCachedKey, 3600);
    } else if (note.isArchived) {
      pipeline.hSet(ArchiveCachedKey, noteId, JSON.stringify(note));
      pipeline.expire(ArchiveCachedKey, 3600);
    } else if (note.hasReminder) {
      pipeline.hSet(ReminderCachedKey, noteId, JSON.stringify(note));
      pipeline.expire(ReminderCachedKey, 3600);
    } else if (note.category) {
      pipeline.hSet(cachedKey, noteId, JSON.stringify(note));
      pipeline.expire(cachedKey, 3600);
    }

    res.status(201).json({
      message: "Collaborator added successfully",
      collaborator: newCollaborator,
    });
  } catch (error) {
    next(error);
  }
};

// noteLink

// have to create duplicate note in collaborator's account
// send email to collaborator with note link
// when add collaborator have to add owner id in note
