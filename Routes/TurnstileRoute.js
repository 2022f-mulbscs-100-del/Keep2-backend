import express from "express";
import { verifyTurnstileToken } from "../Controllers/TurnstileController.js";

const route = express.Router();

route.post("/turnstile-verify", verifyTurnstileToken);

export default route;
