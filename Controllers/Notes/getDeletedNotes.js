import Notes from "../../Modals/notes.js";

export const getDeletedNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    const deletedNotes = await Notes.findAll({
      where: { isDeleted: true, userId },
      order: [["updatedAt", "DESC"]],
    });
    res.json(deletedNotes);
  } catch (error) {
    next(error);
  }
};
