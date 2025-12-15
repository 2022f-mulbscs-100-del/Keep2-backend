import express from "express";
import { PaymentIntent } from "../Controllers/PaymentController.js";

const route = express.Router();

route.post("/payment", PaymentIntent);

export default route;
