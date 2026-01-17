import Notes from "../../Modals/notes.js";

export const deleteNotes = async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    await Notes.destroy({ where: { isDeleted: true, userId } });
    res.json("Note Deleted");
  } catch (error) {
    next(error);
  }
};
