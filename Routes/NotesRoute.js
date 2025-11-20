import express from 'express';
import { addNotes, deleteNotes, getNotes, getNotesById, updateNotes } from '../Controllers/NotesController.js';

const route = express.Router()

route.get('/notes', getNotes);
route.post('/addnotes',addNotes);
route.delete('/notes/:id',deleteNotes);
route.put('/UpdateNotes/:id',updateNotes);
route.get('/notes/:id',getNotesById);


export default route;