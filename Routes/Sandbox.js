import express from 'express';
import { deleteSandbox, generateSandbox } from '../Controllers/SandboxController.js';



const Sandboxroute = express.Router()

Sandboxroute.post('/generateSandbox',generateSandbox);
Sandboxroute.delete('/deleteSandbox',deleteSandbox);

export default Sandboxroute;