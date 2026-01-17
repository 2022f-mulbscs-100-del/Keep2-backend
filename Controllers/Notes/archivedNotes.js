import Notes from "../../Modals/notes.js";

export const getArchivedNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    const archivedNotes = await Notes.findAll({
      where: { isArchived: true, isDeleted: false, userId },
    });
    res.json(archivedNotes);
  } catch (error) {
    next(error);
  }
};
