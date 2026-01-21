import express from "express";
import { EmailController } from "../Controllers/EmailController.js";

const route = express.Router();

route.post("/send-email", EmailController);

export default route;
