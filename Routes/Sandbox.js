import express from "express";
import {
  deleteSandbox,
  generateSandbox,
} from "../Controllers/SandboxController.js";
import { verifyToken } from "../Middleware/verifyToken.js";
const Sandboxroute = express.Router();

Sandboxroute.post("/generateSandbox", verifyToken, generateSandbox);
Sandboxroute.delete("/deleteSandbox", verifyToken, deleteSandbox);

export default Sandboxroute;
