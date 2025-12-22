import express from "express";
import route from "./Routes/NotesRoute.js";
import dotenv from "dotenv";
import { authenticateDB } from "./config/db.confing.js";
import cors from "cors";
import Sandboxroute from "./Routes/Sandbox.js";
import Refresh from "./Controllers/RefreshController.js";
dotenv.config();
import AuthRoute from "./Routes/AuthRoute.js";
import cookieParser from "cookie-parser";
import UserRoute from "./Routes/UserRoute.js";
import paymentRoute from "./Routes/paymentRoute.js";
import sendEmail from "./Routes/EmailRoute.js";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/api", route);
app.use("/api", AuthRoute);
app.use("/api", Sandboxroute);
app.use("/api", UserRoute);
app.use("/api", paymentRoute);
app.use("/api", sendEmail);
app.get("/refresh", Refresh);

//eslint-disable-next-line
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

authenticateDB();
app.listen(process.env.SERVER_PORT, () => {
  console.log("running");
});
