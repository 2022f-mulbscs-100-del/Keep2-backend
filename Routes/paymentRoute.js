import express from "express";
import {
  SubscriptionPaymentIntent,
  UpdatePaymentMethod,
  setUpIntent,
  CancelSubscription,
  UpgradeSubscription,
  //   DowngradeSubscription
} from "../Controllers/Payment/PaymentController.js";
import { VerifyToken } from "../utils/VerifyToken.js";

const route = express.Router();

// route.post("/payment", VerifyToken, PaymentIntent);
route.post("/create-payment-intent", VerifyToken, SubscriptionPaymentIntent);
route.post("/update-method-payment", VerifyToken, UpdatePaymentMethod);
route.get("/setUpIntent", VerifyToken, setUpIntent);
route.get("/cancel-subscription", VerifyToken, CancelSubscription);
route.get("/upgrade-subscription", VerifyToken, UpgradeSubscription);
// route.get("/downgrade-subscription", VerifyToken, DowngradeSubscription);
export default route;
