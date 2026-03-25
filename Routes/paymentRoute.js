import express from "express";
import {
  SubscriptionPaymentIntent,
  UpdatePaymentMethod,
  setUpIntent,
  CancelSubscription,
  UpgradeSubscription,
  //   DowngradeSubscription
} from "../Controllers/PaymentController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("PaymentRoute initialized");

/**
 * @swagger
 * /create-payment-intent:
 *   post:
 *     summary: Create a payment intent for subscription
 *     description: Create a Stripe payment intent for subscription payment.
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "price_1234567890"
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Payment processing error
 */
route.post("/create-payment-intent", VerifyToken, SubscriptionPaymentIntent);

/**
 * @swagger
 * /update-method-payment:
 *   post:
 *     summary: Update payment method
 *     description: Update the payment method for the user's subscription.
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 example: "pm_1234567890"
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Update failed
 */
route.post("/update-method-payment", VerifyToken, UpdatePaymentMethod);

/**
 * @swagger
 * /setUpIntent:
 *   get:
 *     summary: Get setup intent for payment method
 *     description: Retrieve a Stripe setup intent for adding/updating payment methods.
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Setup intent retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Setup intent creation failed
 */
route.get("/setUpIntent", VerifyToken, setUpIntent);

/**
 * @swagger
 * /cancel-subscription:
 *   get:
 *     summary: Cancel user subscription
 *     description: Cancel the active subscription for the authenticated user.
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription found
 *       500:
 *         description: Cancellation failed
 */
route.get("/cancel-subscription", VerifyToken, CancelSubscription);

/**
 * @swagger
 * /upgrade-subscription:
 *   get:
 *     summary: Upgrade subscription plan
 *     description: Upgrade the user's current subscription to a higher tier.
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Upgrade options retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upgrade failed
 */
route.get("/upgrade-subscription", VerifyToken, UpgradeSubscription);
// route.get("/downgrade-subscription", VerifyToken, DowngradeSubscription);
export default route;
