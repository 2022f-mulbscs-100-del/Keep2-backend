import express from "express";
import {
  deleteSandbox,
  generateSandbox,
} from "../Controllers/SandboxController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const Sandboxroute = express.Router();

Sandboxroute.post("/generateSandbox", VerifyToken, generateSandbox);
Sandboxroute.delete("/deleteSandbox", VerifyToken, deleteSandbox);
export default Sandboxroute;
