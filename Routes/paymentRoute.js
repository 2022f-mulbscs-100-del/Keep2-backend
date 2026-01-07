import express from "express";
import {
  SubscriptionPaymentIntent,
  UpdatePaymentMethod,
  setUpIntent,
} from "../Controllers/PaymentController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const route = express.Router();

// route.post("/payment", VerifyToken, PaymentIntent);
route.post("/create-payment-intent", VerifyToken, SubscriptionPaymentIntent);
route.post("/update-method-payment", VerifyToken, UpdatePaymentMethod);
route.get("/setUpIntent", VerifyToken, setUpIntent);
export default route;
