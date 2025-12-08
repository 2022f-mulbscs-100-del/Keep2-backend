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
import { verifyToken } from "../Middleware/verifyToken.js";

const route = express.Router();

route.get("/notes", verifyToken, getNotes);
route.post("/addnotes", verifyToken, addNotes);
route.delete("/deleteNotes", verifyToken, deleteNotes);
route.delete("/deleteNotes/:id", verifyToken, deleteNotesById);
route.put("/UpdateNotes/:id", verifyToken, updateNotes);
route.get("/notes/:id", verifyToken, getNotesById);
route.patch("/pinnedNotes/:id", verifyToken, pinnedNotes);
route.get("/deletedNotes", verifyToken, getDeletedNotes);
route.get("/getArchivedNotes", verifyToken, getArchivedNotes);

export default route;
