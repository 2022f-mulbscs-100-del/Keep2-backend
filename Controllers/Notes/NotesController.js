export { createNote } from "./createNote.js";
export { deleteNotes } from "./deleteNotes.js";
export { deleteNotesById } from "./deleteNoteById.js";
export { getDeletedNotes } from "./getDeletedNotes.js";
export { getNotesById } from "./getNoteById.js";
export { getNotes } from "./getNotes.js";
export { updateNotes } from "./updateNote.js";
export { getArchivedNotes } from "./archivedNotes.js";

// export const pinnedNotes = async (req, res, next) => {
//   const { id } = req.params;
//   const { pinned } = req.body;
//   try {
//     const findNote = await notes.findByPk(id);
//     if (!findNote) {
//       return next(ErrorHandler(404, "Note not found"));
//     }
//     await notes.update({ pinned }, { where: { id } });
//     res.json("Note Updated");
//   } catch (error) {
//     next(error);
//   }
// };

//// have to merge the new image with existing image array in update notes controller
/// right now the issue is about the json the db is giving the json which i am unable to convert into array so i used Object.values to convert it into array
// but its disaster approach have to find another way to do it properly
