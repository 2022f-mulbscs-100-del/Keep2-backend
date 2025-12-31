import express from "express";
import { PaymentIntent } from "../Controllers/PaymentController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const route = express.Router();

route.post("/payment", VerifyToken, PaymentIntent);

export default route;
