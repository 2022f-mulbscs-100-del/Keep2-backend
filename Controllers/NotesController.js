import notes from "../Modals/notes.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
export const addNotes = async (req, res, next) => {
  try {
    const { title, description, pinned } = req.body;
    const newNote = await notes.create({
      title,
      description,
      pinned,
      isDeleted: false,
      isArchived: false,
    });

    res.json(newNote);
  } catch (error) {
    next(error);
  }
};

export const pinnedNotes = async (req, res, next) => {
  const { id } = req.params;
  const { pinned } = req.body;
  try {
    const findNote = await notes.findByPk(id);
    if (!findNote) {
      return next(ErrorHandler(404, "Note not found"));
    }
    await notes.update({ pinned }, { where: { id } });
    res.json("Note Updated");
  } catch (error) {
    next(error);
  }
};

export const deleteNotes = async (req, res, next) => {
  try {
    await notes.destroy({ where: { isDeleted: true } });
    res.json("Note Deleted");
  } catch (error) {
    next(error);
  }
};

export const deleteNotesById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const note = await notes.findByPk(id);
    if (!note) {
      return next(ErrorHandler(404, "Note not found"));
    }
    await notes.destroy({ where: { id } });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getArchivedNotes = async (req, res, next) => {
  try {
    const archivedNotes = await notes.findAll({
      where: { isArchived: true, isDeleted: false },
    });
    res.json(archivedNotes);
  } catch (error) {
    next(error);
  }
};

export const updateNotes = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, pinned, isDeleted, isArchived, imageUrl } =
    req.body;

  try {
    const note = await notes.findByPk(id);
    if (!note) {
      return next(ErrorHandler(404, "Note not found"));
    }
    const existingImages = JSON.parse(note.dataValues.image || "[]");
    const newImages = Array.isArray(imageUrl) ? imageUrl : [];
    const imageUrlCombined = [...existingImages, ...newImages];
    const updatedNote = await notes.update(
      {
        title,
        description,
        pinned,
        isDeleted,
        isArchived,
        image: imageUrlCombined,
      },
      { where: { id } }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    const newNote = await notes.findByPk(id);
    res.json(newNote);
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res) => {
  const allNotes = await notes.findAll({
    order: [["createdAt", "DESC"]],
    where: { isDeleted: false, isArchived: false },
  });
  res.json(allNotes);
};

export const getNotesById = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  try {
    const note = await notes.findByPk(id);
    res.json(note);
  } catch (error) {
    next(error);
  }
};

export const getDeletedNotes = async (req, res, next) => {
  try {
    const deletedNotes = await notes.findAll({
      where: { isDeleted: true },
      order: [["updatedAt", "DESC"]],
    });
    res.json(deletedNotes);
  } catch (error) {
    next(error);
  }
};

//// have to merge the new image with existing image array in update notes controller
/// right now the issue is about the json the db is giving the json which i am unable to convert into array so i used Object.values to convert it into array
// but its disaster approach have to find another way to do it properly
