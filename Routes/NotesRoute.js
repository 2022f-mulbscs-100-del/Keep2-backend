import express from "express";
import * as NotesController from "../Controllers/Notes/NotesController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const route = express.Router();

route.get("/notes", VerifyToken, getNotes);
route.post("/addnotes", VerifyToken, addNotes);
route.delete("/deleteNotes", VerifyToken, deleteNotes);
route.delete("/deleteNotes/:id", VerifyToken, deleteNotesById);
route.put("/UpdateNotes/:id", VerifyToken, updateNotes);
route.get("/notes/:id", VerifyToken, getNotesById);
route.patch("/pinnedNotes/:id", VerifyToken, pinnedNotes);
route.get("/deletedNotes", VerifyToken, getDeletedNotes);
route.get("/getArchivedNotes", VerifyToken, getArchivedNotes);

export default route;
