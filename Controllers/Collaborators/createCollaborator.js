import Collaborators from "../../Modals/collaborators.modal.js";
import axios from "axios";
import User from "../../Modals/UserModal.js";
import Notes from "../../Modals/notes.modal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";

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
