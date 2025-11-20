import express from 'express'
import route from './Routes/NotesRoute.js';
import dotenv from 'dotenv';
import { authenticateDB } from './config/db.confing.js';
import cors from 'cors';
import Sandboxroute from './Routes/Sandbox.js';


dotenv.config();

const app = express();


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use('/api', route);
app.use('/api', Sandboxroute);

authenticateDB();

app.listen(process.env.SERVER_PORT, () => {
  console.log("running")
})