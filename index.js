import express from "express";
import route from "./Routes/NotesRoute.js";
import dotenv from "dotenv";
import { authenticateDB } from "./config/db.confing.js";
import cors from "cors";
import Sandboxroute from "./Routes/Sandbox.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/api", route);
app.use("/api", Sandboxroute);

//eslint-disable-next-line
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

authenticateDB();
//eslint-disable-next-line no-undef
app.listen(process.env.SERVER_PORT, () => {
  console.log("running");
});
