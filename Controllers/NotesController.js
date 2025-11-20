import notes from "../Modals/notes.js";

export const addNotes = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newNote = await notes.create({
      title,
      description,
    });

    res.json(newNote);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteNotes = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await notes.destroy({ where: { id } });
    res.json("Note Deleted");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateNotes = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const updatedNote = await notes.update(
      { title, description },
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
  const allNotes = await notes.findAll({ order: [["createdAt", "DESC"]] });
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
