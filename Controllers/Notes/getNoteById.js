import Notes from "../../Modals/notes.js";

export const getNotesById = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  try {
    const note = await Notes.findByPk(id);
    res.json(note);
  } catch (error) {
    next(error);
  }
};
