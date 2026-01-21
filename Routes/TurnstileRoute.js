import express from "express";
import { verifyTurnstileToken } from "../Controllers/TurnstileController.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();

route.post("/turnstile-verify", verifyTurnstileToken);

export default route;
