import { Op } from "sequelize";
import Notes from "../../Modals/notes.modal.js";
import { logger } from "../../utils/Logger.js";
import User from "../../Modals/UserModal.js";
import Collaborators from "../../Modals/collaborators.modal.js";

export const getNotes = async (req, res) => {
  const { id: userId } = req.user;
  logger.info("Fetching notes", { userId, user: req.user });
  logger.info("Fetching notes for userId: ", { userId });
  const user = await User.findByPk(userId);

  if (!user) {
    logger.error("User not found for userId: ", { userId });
    return res.status(404).json({ message: "User not found" });
  }
  const collaboratorNotes = await Collaborators.findAll({
    where: { collaborator: user.email },
    attributes: ["noteId"],
  });

  const allNotes = await Notes.findAll({
    where: {
      [Op.or]: [
        { userId: userId },
        { id: { [Op.in]: collaboratorNotes.map((note) => note.noteId) } },
      ],
    },
    include: [
      {
        model: Collaborators,
        as: "collaborators",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  logger.info("Notes fetched successfully for userId: ", {
    userId,
    noteCount: allNotes.length,
  });

  res.json(allNotes);
};

// 4️⃣ How [Op.in] uses it

// [Op.in] is equivalent to:

// Notes.id IN (101, 103, 107)

// okay so have to find all notes where user is collaborator
// then have to fetch those notes and send to user

// now the next problem is when we show collaborator a note it will be able to
// remove collaborator have to
// okay we do check with user/owner id with  of note with user id it if it matches then only show delete option
// so that only owner remove collaborator not collaborator himself
// also have to hide edit option from collaborator
