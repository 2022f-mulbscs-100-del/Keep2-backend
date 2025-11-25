import notes from "../Modals/notes.js";

export const addNotes = async (req, res) => {
  try {
    console.log(req.body);
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
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const pinnedNotes = async (req, res) => {
  const { id } = req.params;
  const { pinned } = req.body;
  console.log(id, pinned);
  try {
    await notes.update({ pinned }, { where: { id } });
    res.json("Note Updated");
  } catch (error) {
    res
      .status(error.status || 500)
      .json(error.message || "Internal Server Error");
  }
};

export const deleteNotes = async (req, res) => {
  try {
    await notes.destroy({ where: { isDeleted: true } });
    res.json("Note Deleted");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteNotesById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNote = await notes.destroy({ where: { id } });

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getArchivedNotes = async (req, res) => {
  try {
    const archivedNotes = await notes.findAll({
      where: { isArchived: true, isDeleted: false },
    });
    res.json(archivedNotes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateNotes = async (req, res) => {
  const { id } = req.params;
  const { title, description, pinned, isDeleted, isArchived, imageUrl } =
    req.body;
  const note = await notes.findByPk(id);
  const existingImages = JSON.parse(note.dataValues.image || "[]");
  const newImages = Array.isArray(imageUrl) ? imageUrl : [];
  console.log("gettin from db", existingImages);
  console.log("getting from req body", newImages);
  const imageUrlCombined = [...existingImages, ...newImages];
  console.log("merging images to store in db", imageUrlCombined);

  try {
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
    const note = await notes.findByPk(id);
    res.json(note);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getNotes = async (req, res) => {
  const allNotes = await notes.findAll({
    order: [["createdAt", "DESC"]],
    where: { isDeleted: false, isArchived: false },
  });
  res.json(allNotes);
};

export const getNotesById = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const note = await notes.findByPk(id);
    res.json(note);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getDeletedNotes = async (req, res) => {
  try {
    const deletedNotes = await notes.findAll({
      where: { isDeleted: true },
      order: [["updatedAt", "DESC"]],
    });
    res.json(deletedNotes);
  } catch (error) {
    res
      .status(error.status || 500)
      .json(error.message || "Internal Server Error");
  }
};

//// have to merge the new image with existing image array in update notes controller
/// right now the issue is about the json the db is giving the json which i am unable to convert into array so i used Object.values to convert it into array
// but its disaster approach have to find another way to do it properly
