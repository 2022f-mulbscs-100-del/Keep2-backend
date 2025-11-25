import express from "express";
import {
  addNotes,
  deleteNotes,
  deleteNotesById,
  getDeletedNotes,
  getNotes,
  getNotesById,
  pinnedNotes,
  updateNotes,
  getArchivedNotes,
} from "../Controllers/NotesController.js";

const route = express.Router();

route.get("/notes", getNotes);
route.post("/addnotes", addNotes);
route.delete("/deleteNotes", deleteNotes);
route.delete("/deleteNotes/:id", deleteNotesById);
route.put("/UpdateNotes/:id", updateNotes);
route.get("/notes/:id", getNotesById);
route.patch("/pinnedNotes/:id", pinnedNotes);
route.get("/deletedNotes", getDeletedNotes);
route.get("/getArchivedNotes", getArchivedNotes);

export default route;
