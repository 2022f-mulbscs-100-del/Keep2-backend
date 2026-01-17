import Notes from "../../Modals/notes.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";

export const deleteNotesById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const note = await Notes.findByPk(id);
    if (!note) {
      return next(ErrorHandler(404, "Note not found"));
    }
    await Notes.destroy({ where: { id } });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};
